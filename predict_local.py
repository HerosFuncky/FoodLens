"""Teste le modèle Food-101 ré-entraîné EN LOCAL, sans endpoint Azure ni Docker.

Usage :
    python predict_local.py <chemin_image>           # utilise la derniere version enregistree
    python predict_local.py <chemin_image> 4          # force une version precise

Au premier lancement, telecharge le modele dans ./local_model (auth navigateur).
Les fois suivantes il reutilise le modele deja telecharge.
"""
import sys
import os
import glob
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Memes classes / pretraitement que src/score.py (l'endpoint Azure)
FOOD101_CLASSES = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare",
    "beet_salad", "beignets", "bibimbap", "bread_pudding", "breakfast_burrito",
    "bruschetta", "caesar_salad", "cannoli", "caprese_salad", "carrot_cake",
    "ceviche", "cheesecake", "cheese_plate", "chicken_curry", "chicken_quesadilla",
]

LOCAL_DIR = "./local_model"


def ensure_model(version=None):
    found = glob.glob(os.path.join(LOCAL_DIR, "**", "model.pt"), recursive=True)
    if found and version is None:
        return found[0]

    from azure.ai.ml import MLClient
    from azure.identity import InteractiveBrowserCredential

    ml_client = MLClient(
        credential=InteractiveBrowserCredential(),
        subscription_id="6a69f0fe-0925-4755-a39f-c9eea93e4364",
        resource_group_name="foodlens-rg",
        workspace_name="foodlens-ml",
    )
    if version is None:
        version = max(int(m.version) for m in ml_client.models.list(name="foodlens-classifier"))
    print(f"Telechargement de foodlens-classifier v{version} -> {LOCAL_DIR} ...")
    target = os.path.join(LOCAL_DIR, f"v{version}")
    ml_client.models.download(name="foodlens-classifier", version=str(version),
                              download_path=target)
    found = glob.glob(os.path.join(target, "**", "model.pt"), recursive=True)
    if not found:
        raise SystemExit("model.pt introuvable apres telechargement.")
    return found[0]


def main():
    if len(sys.argv) < 2:
        print("Usage: python predict_local.py <chemin_image> [version]")
        return
    image_path = sys.argv[1]
    version = int(sys.argv[2]) if len(sys.argv) > 2 else None

    model_path = ensure_model(version)
    print(f"Modele   : {model_path}")
    print(f"Image    : {image_path}\n")

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 20)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0]

    top = torch.topk(probs, 3)
    print("Top-3 predictions :")
    for prob, idx in zip(top.values, top.indices):
        print(f"  {FOOD101_CLASSES[idx]:22s} {prob.item() * 100:5.1f}%")


if __name__ == "__main__":
    main()
