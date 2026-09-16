from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.azure_cv import analyze_image
from services.azure_ml import classify_image
from services.prompt_flow import get_nutrition_advice
from services.nutrition_static import lookup_static
import httpx
import os
from fastapi import FastAPI, UploadFile, File, Form
import json

app = FastAPI(title="FoodLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FOOD_TAGS_PRIORITY = [
    "banana", "apple", "orange", "strawberry", "grape", "lemon", "peach", "pear",
    "chicken", "beef", "steak", "pork", "salmon", "fish", "shrimp", "egg",
    "bread", "baguette", "toast", "loaf", "sandwich", "croissant", "bagel",
    "rice", "pasta", "noodle", "cheese", "tomato", "potato", "carrot",
    "salad", "soup", "pizza", "burger", "fries", "sushi",
    "cake", "pie", "tart", "pastry", "cookie", "muffin", "donut", "dessert", "pancake",
]

GENERIC_TAGS = {
    "food", "dish", "cuisine", "meal", "produce", "ingredient", "plate",
    "tableware", "recipe", "snack", "fast food", "junk food", "baked goods",
    "dairy", "indoor", "still life", "fruit", "vegetable",
    "pan", "pot", "skillet", "frying pan", "cookware", "bowl", "tray",
    "kitchen", "baking", "container", "saucer", "cutlery",
}

def get_best_food_tag(tags: list) -> str:
    lowered = [(t, t.lower()) for t in tags]
    for pref in FOOD_TAGS_PRIORITY:
        for original, low in lowered:
            if pref == low or pref in low.split() or pref in low:
                return original
    for original, low in lowered:
        if low not in GENERIC_TAGS:
            return original
    return tags[0] if tags else "unknown"

def ml_label_is_plausible(ml_label: str, tags: list) -> bool:
    label_words = set(ml_label.lower().replace("_", " ").split())
    tag_words = set()
    for t in tags:
        tag_words.update(t.lower().replace("_", " ").split())
    return bool(label_words & tag_words)

BAD_DESC_KEYWORDS = ("dehydrated", "dried", "chips", "fried", "juice",
                     "canned", "baby food", "infant", "powder", "syrup")

def _search_usda(query: str, data_type: str, api_key: str):
    try:
        response = httpx.get(
            "https://api.nal.usda.gov/fdc/v1/foods/search",
            params={"query": query, "api_key": api_key, "pageSize": 5,"dataType": data_type},
            timeout=10,
        )
        if response.status_code != 200:
            return None
        foods = response.json().get("foods", [])
    except Exception:
        return None

    foods = sorted(
        foods,
        key=lambda f: any(bad in f.get("description", "").lower() for bad in BAD_DESC_KEYWORDS),
    )
    for food in foods:
        nutrients = {}
        for n in food.get("foodNutrients", []):
            nutrients[n.get("nutrientName", "")] = n.get("value") or n.get("amount") or 0
        calories = nutrients.get("Energy", 0)
        protein = nutrients.get("Protein", 0)
        carbs = nutrients.get("Carbohydrate, by difference", 0)
        fat = nutrients.get("Total lipids (fat)", 0)

        if calories == 0 and fat == 0:
            continue
        if carbs == 0 and fat == 0:
            continue
        kcal_est = protein * 4 + carbs * 4 + fat * 9
        if calories > 0 and kcal_est > 0 and abs(calories - kcal_est) > 0.25 * calories + 20:
            continue

        return {
            "calories": round(calories, 1),
            "protein": round(protein, 1),
            "carbs": round(carbs, 1),
            "fat": round(fat, 1),
        }
    return None

def lookup_nutrition(food_name: str, fallback_tags: list = None) -> dict:
    api_key = os.getenv("USDA_API_KEY")
    candidates = [food_name.replace("_", " ").strip()]
    for tag in (fallback_tags or []):
        clean = tag.replace("_", " ").strip()
        if clean and clean.lower() not in GENERIC_TAGS and clean not in candidates:
            candidates.append(clean)

    for query in candidates:
        for data_type in ["Foundation", "SR Legacy", "Survey (FNDDS)"]:
            res = _search_usda(query, data_type, api_key)
            if res:
                return res
    return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

@app.get("/")
def root():
    return {"status": "FoodLens API is running"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    allergens: str = Form(default="[]")
):
    allergens_list = json.loads(allergens)
    image_bytes = await file.read()

    try:
        tags = analyze_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Azure CV: {str(e)}")
    print(f"[DEBUG] Azure CV tags = {tags}", flush=True)

    food_label = get_best_food_tag(tags)
    print(f"[DEBUG] food_label = {food_label!r}", flush=True)

    confidence = 0.0
    ml_label = None
    try:
        ml_result = classify_image(image_bytes)
        ml_label = ml_result.get("label")
        ml_conf = ml_result.get("confidence", 0.0)
        print(f"[DEBUG] Azure ML -> label={ml_label!r} conf={ml_conf}", flush=True)
        if ml_label and ml_conf >= 0.6 and (
            ml_label_is_plausible(ml_label, tags) or ml_conf >= 0.80
        ):
            food_label = ml_label
            confidence = ml_conf
            print(f"[DEBUG] ML accepte -> {food_label!r}", flush=True)
        else:
            print(f"[DEBUG] ML rejete -> on garde {food_label!r}", flush=True)
    except Exception as e:
        print(f"[DEBUG] Azure ML erreur: {type(e).__name__}: {e}", flush=True)

    agent_result = get_nutrition_advice(
        food_label, allergens=allergens_list, tags=tags, ml_label=ml_label
    )
    identified_food = agent_result.get("identified_food") or food_label
    usda_query = agent_result.get("usda_query") or food_label

    static_ml = lookup_static(ml_label or "")
    static_food = lookup_static(food_label)
    if static_ml:
        nutrition = static_ml
    elif static_food:
        nutrition = static_food
    else:
        nutrition = lookup_nutrition(usda_query, fallback_tags=[food_label] + tags)

    return {
        "tags": tags,
        "food": food_label,
        "identified_food": identified_food,
        "confidence": confidence,
        "ml_label": ml_label,
        "nutrition": nutrition,
        "safe": agent_result.get("safe", True),
        "alert": agent_result.get("alert", ""),
        "advice": agent_result.get("advice", "")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
