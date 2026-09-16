import httpx
import os

def get_nutrition_advice(food_label: str, macros: dict = None, allergens: list = None,
                         tags: list = None, ml_label: str = None) -> dict:

    allergens = allergens or []
    tags = tags or []
    allergens_str = ", ".join(allergens) if allergens else "aucune allergie connue"
    tags_str = ", ".join(tags[:10]) if tags else "aucun"
    ml_str = ml_label if ml_label else "non disponible"

    prompt = f"""Tu es un expert en allergies alimentaires et en nutrition.

Donnees de detection sur la photo :
- Classification automatique : {food_label}
- Hypothese du modele ML (peut etre erronee) : {ml_str}
- Tags Azure Computer Vision : {tags_str}
- Allergenes declares par l'utilisateur : {allergens_str}

Etape 1 - Identifie l'aliment reel le plus probable en combinant la classification ET les tags.
La classification peut etre imprecise ; les tags decrivent reellement la photo : privilegie-les en cas de doute.
Etape 2 - Raisonne sur les ingredients typiques de cet aliment et determine s'il contient
naturellement ou frequemment l'un des allergenes declares. Ne te base PAS sur les valeurs nutritionnelles.

Reponds UNIQUEMENT en JSON, sans texte avant ou apres :
{{
  "identified_food": "nom de l'aliment reel identifie, en francais",
  "usda_query": "terme de recherche court EN ANGLAIS pour la base nutritionnelle USDA (ex: apple pie, grilled chicken breast, banana)",
  "safe": true ou false,
  "alert": "si danger : quel allergene est present et pourquoi c'est risque. Sinon laisse vide.",
  "advice": "conseil nutritionnel court en francais (1-2 phrases)"
}}

/no_think"""

    lm_studio_url = os.getenv("LM_STUDIO_URL", "http://127.0.0.1:1234").rstrip("/")
    try:
        response = httpx.post(
            f"{lm_studio_url}/v1/chat/completions",
            json={
                "model": os.getenv("LM_STUDIO_MODEL", "qwen/qwen3-8b"),
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 800
            },
            timeout=90
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        import json
        import re
        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            parsed.setdefault("identified_food", food_label)
            parsed.setdefault("usda_query", food_label)
            return parsed
        return {"identified_food": food_label, "usda_query": food_label, "safe": True, "alert": "", "advice": content}

    except Exception as e:
        return {"identified_food": food_label, "usda_query": food_label, "safe": True, "alert": "", "advice": "Conseil non disponible."}
