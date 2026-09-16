import os
import glob
from io import BytesIO

FOOD101_CLASSES = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare",
    "beet_salad", "beignets", "bibimbap", "bread_pudding", "breakfast_burrito",
    "bruschetta", "caesar_salad", "cannoli", "caprese_salad", "carrot_cake",
    "ceviche", "cheesecake", "cheese_plate", "chicken_curry", "chicken_quesadilla",
]

_model = None
_transform = None


def _candidate_dirs():
    here = os.path.dirname(os.path.abspath(__file__))
    backend = os.path.dirname(here)
    root = os.path.dirname(backend)
    dirs = []
    env_dir = os.getenv("MODEL_LOCAL_DIR")
    if env_dir:
        dirs.append(env_dir)
    dirs += [os.path.join(root, "local_model"), os.path.join(backend, "local_model")]
    return dirs


def _find_model_pt():
    for d in _candidate_dirs():
        hits = glob.glob(os.path.join(d, "**", "model.pt"), recursive=True)
        if hits:
            return hits[0]
    return None


def _load():
    global _model, _transform
    if _model is not None:
        return
    import torch
    import torch.nn as nn
    from torchvision import models, transforms

    path = _find_model_pt()
    if not path:
        raise FileNotFoundError(
            "model.pt introuvable dans ./local_model. "
            "Lance d'abord : python predict_local.py <image>  (ça télécharge le modèle)."
        )
    m = models.resnet18(weights=None)
    m.fc = nn.Linear(m.fc.in_features, 20)
    m.load_state_dict(torch.load(path, map_location="cpu"))
    m.eval()
    _model = m
    _transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    print(f"[local_ml] modele charge : {path}")


def classify_local(image_bytes: bytes) -> dict:
    import torch
    from PIL import Image

    _load()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(image).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(_model(tensor), dim=1)
        conf, pred = torch.max(probs, 1)
    return {"label": FOOD101_CLASSES[pred.item()], "confidence": float(conf.item())}
