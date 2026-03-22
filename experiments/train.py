import torch
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

from models.dataset import DNADrugResponseDataset
from models.cnn_ann import CNN_ANN

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

dataset = DNADrugResponseDataset(
    "data/processed/training_subset.csv"
)

loader = DataLoader(
    dataset,
    batch_size=128,
    shuffle=True,
    num_workers=4,
    pin_memory=True
)

model = CNN_ANN().to(device)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

EPOCHS = 5

for epoch in range(EPOCHS):
    total_loss = 0.0

    for x, y in loader:
        x = x.to(device)
        y = y.to(device)

        optimizer.zero_grad()
        preds = model(x)
        loss = criterion(preds, y)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch+1}/{EPOCHS} | Loss: {total_loss/len(loader):.4f}")
