import os
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import base64
from io import BytesIO

FOOD101_CLASSES = ["apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio", "beef_tartare",
    "beet_salad", "beignets", "bibimbap", "bread_pudding", "breakfast_burrito",
    "bruschetta", "caesar_salad", "cannoli", "caprese_salad", "carrot_cake",
    "ceviche", "cheesecake", "cheese_plate", "chicken_curry", "chicken_quesadilla"]

def init():
    global model, transform
    model_dir = os.getenv("AZUREML_MODEL_DIR")
    model_path = os.path.join(model_dir, "model", "model.pt")
    
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 20)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

def run(raw_data):
    data = json.loads(raw_data)
    image_b64 = data["image"]
    image_bytes = base64.b64decode(image_b64)
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probs, 1)
    
    label = FOOD101_CLASSES[predicted.item()]
    return {"label": label, "confidence": float(confidence.item())}