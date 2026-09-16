import httpx
import os
from dotenv import load_dotenv
load_dotenv()

FOODS = [
    "banana", "apple", "orange", "chicken", "beef",
    "salmon", "egg", "bread", "rice", "pasta",
    "cheese", "tomato", "salad", "pizza", "burger"
]

def lookup_usda(food_name: str) -> dict:
    api_key = os.getenv("USDA_API_KEY")
    
    for data_type in ["Foundation", "SR Legacy"]:
        response = httpx.get(
            "https://api.nal.usda.gov/fdc/v1/foods/search",
            params={
                "query": food_name + (" raw" if data_type == "Foundation" else ""),
                "api_key": api_key,
                "pageSize": 1,
                "dataType": data_type
            },
            timeout=10
        )
        if response.status_code != 200:
            continue
        foods = response.json().get("foods", [])
        if not foods:
            continue
        f = foods[0]
        nutrients = {}
        for n in f.get("foodNutrients", []):
            name = n.get("nutrientName", "")
            value = n.get("value") or n.get("amount") or 0
            nutrients[name] = value
        
        calories = nutrients.get("Energy", 0)
        fat = nutrients.get("Total lipids (fat)", 0)
        
        # Ignore si résultat aberrant
        if calories == 0 and fat == 0:
            continue
            
        return {
            "product_found": f.get("description", "?"),
            "calories": calories,
            "protein": nutrients.get("Protein", 0),
            "carbs": nutrients.get("Carbohydrate, by difference", 0),
            "fat": fat,
        }
    
    return None

print(f"{'Food':<12} {'Product found':<40} {'Cal':>6} {'Prot':>6} {'Carbs':>6} {'Fat':>6}")
print("-" * 80)

for food in FOODS:
    result = lookup_usda(food)
    if result:
        print(f"{food:<12} {result['product_found'][:38]:<40} {str(result['calories']):>6} {str(result['protein']):>6} {str(result['carbs']):>6} {str(result['fat']):>6}")
    else:
        print(f"{food:<12} {'NOT FOUND':<40} {'N/A':>6}")