STATIC_NUTRITION = {
    "apple_pie":          {"calories": 296, "protein": 3.0,  "carbs": 43.0, "fat": 13.0},
    "baby_back_ribs":     {"calories": 290, "protein": 26.0, "carbs": 0.0,  "fat": 20.0},
    "baklava":            {"calories": 430, "protein": 6.0,  "carbs": 52.0, "fat": 22.0},
    "beef_carpaccio":     {"calories": 150, "protein": 20.0, "carbs": 1.0,  "fat": 8.0},
    "beef_tartare":       {"calories": 180, "protein": 21.0, "carbs": 1.0,  "fat": 10.0},
    "beet_salad":         {"calories": 130, "protein": 4.0,  "carbs": 15.0, "fat": 6.0},
    "beignets":           {"calories": 390, "protein": 5.0,  "carbs": 47.0, "fat": 20.0},
    "bibimbap":           {"calories": 490, "protein": 25.0, "carbs": 72.0, "fat": 12.0},
    "bread_pudding":      {"calories": 250, "protein": 7.0,  "carbs": 34.0, "fat": 10.0},
    "breakfast_burrito":  {"calories": 430, "protein": 22.0, "carbs": 40.0, "fat": 20.0},
    "bruschetta":         {"calories": 210, "protein": 6.0,  "carbs": 28.0, "fat": 8.0},
    "caesar_salad":       {"calories": 360, "protein": 15.0, "carbs": 18.0, "fat": 26.0},
    "cannoli":            {"calories": 350, "protein": 7.0,  "carbs": 38.0, "fat": 19.0},
    "caprese_salad":      {"calories": 200, "protein": 12.0, "carbs": 5.0,  "fat": 15.0},
    "carrot_cake":        {"calories": 415, "protein": 4.0,  "carbs": 55.0, "fat": 20.0},
    "ceviche":            {"calories": 110, "protein": 15.0, "carbs": 7.0,  "fat": 2.0},
    "cheese_plate":       {"calories": 380, "protein": 22.0, "carbs": 4.0,  "fat": 31.0},
    "cheesecake":         {"calories": 400, "protein": 7.0,  "carbs": 37.0, "fat": 25.0},
    "chicken_curry":      {"calories": 200, "protein": 18.0, "carbs": 10.0, "fat": 10.0},
    "chicken_quesadilla": {"calories": 380, "protein": 24.0, "carbs": 34.0, "fat": 15.0},
}

def lookup_static(label: str) -> dict | None:
    key = label.lower().replace(" ", "_")
    return STATIC_NUTRITION.get(key)
