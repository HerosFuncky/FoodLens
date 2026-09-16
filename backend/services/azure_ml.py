import os
import httpx

def classify_image(image_bytes: bytes) -> dict:
    if os.getenv("USE_LOCAL_MODEL", "").lower() in ("1", "true", "yes"):
        from services.local_ml import classify_local
        return classify_local(image_bytes)

    endpoint = os.getenv("AZURE_ML_ENDPOINT")
    api_key = os.getenv("AZURE_ML_KEY")

    if not endpoint or not api_key:
        return {"label": "unknown", "confidence": 0.0}

    import base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {"image": image_b64}

    response = httpx.post(endpoint, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()
