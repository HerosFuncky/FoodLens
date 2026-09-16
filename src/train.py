import argparse
import os
from torchvision import datasets, transforms, models
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument("--data_path", type=str, default="./data")
parser.add_argument("--epochs", type=int, default=8)
parser.add_argument("--output_path", type=str, default="./outputs")
args = parser.parse_args()

os.makedirs(args.output_path, exist_ok=True)

# Augmentation à l'entraînement : le modèle voit des variantes recadrées/retournées/
# avec variations de couleur plutôt que les mêmes images figées -> bien meilleure
# généralisation. (score.py garde un simple Resize en inférence, c'est normal.)
transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset = datasets.Food101(root=args.data_path, split="train", download=True, transform=transform)


NUM_CLASSES = 20
PER_CLASS = 300
selected_classes = list(range(NUM_CLASSES))
class_to_new = {c: i for i, c in enumerate(selected_classes)}

labels_all = dataset._labels  # accès direct aux labels : évite de décoder 75k images
per_class_count = {c: 0 for c in selected_classes}
indices = []
for i, label in enumerate(labels_all):
    if label in per_class_count and per_class_count[label] < PER_CLASS:
        indices.append(i)
        per_class_count[label] += 1
    if all(v >= PER_CLASS for v in per_class_count.values()):
        break

print(f"Échantillon : {len(indices)} images sur {len(per_class_count)} classes "
      f"(min/classe = {min(per_class_count.values())})")

subset = Subset(dataset, indices)
loader = DataLoader(subset, batch_size=32, shuffle=True, num_workers=2)

model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0005)

for epoch in range(args.epochs):
    model.train()
    total_loss = 0
    for images, labels in loader:
        labels = torch.tensor([class_to_new[l.item()] for l in labels])
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/{args.epochs} - Loss: {total_loss/len(loader):.4f}")

torch.save(model.state_dict(), os.path.join(args.output_path, "model.pt"))
print("Model saved.")