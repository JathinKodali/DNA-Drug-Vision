import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from datasets.cellline_dataset import CellLineDataset
from models.cellline_model import CellLineDrugResponseModel

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

dataset = CellLineDataset(
    "data/processed/training_dataset.csv",
    max_mutations=200
)

loader = DataLoader(dataset, batch_size=1, shuffle=True)

model = CellLineDrugResponseModel().to(device)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4)

EPOCHS = 10

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0.0

    for x, y in loader:
        x = x.squeeze(0).to(device)
        y = y.view(-1).to(device)

        optimizer.zero_grad()
        preds, _ = model(x)
        loss = criterion(preds, y)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch+1}/{EPOCHS} | Loss: {total_loss/len(loader):.4f}")


torch.save(model.state_dict(), "models/strategy_b_model.pt")
print("Strategy B model saved.")
