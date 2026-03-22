import torch
from torch.utils.data import DataLoader, random_split
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import roc_auc_score

from models.dataset import DNADrugResponseDataset
from models.cnn_ann import CNN_ANN

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

# Load dataset
dataset = DNADrugResponseDataset(
    "data/processed/training_subset.csv"
)

# Split
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_ds, val_ds = random_split(dataset, [train_size, val_size])

train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=128)

# Model
model = CNN_ANN().to(device)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

EPOCHS = 5

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0

    for x, y in train_loader:
        x, y = x.to(device), y.to(device)

        optimizer.zero_grad()
        preds = model(x)
        loss = criterion(preds, y)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    # Validation
    model.eval()
    y_true, y_pred = [], []

    with torch.no_grad():
        for x, y in val_loader:
            x = x.to(device)
            preds = model(x).cpu()

            y_true.extend(y.numpy())
            y_pred.extend(preds.numpy())

    auc = roc_auc_score(y_true, y_pred)

    print(
        f"Epoch {epoch+1}/{EPOCHS} | "
        f"Train Loss: {train_loss/len(train_loader):.4f} | "
        f"Val AUC: {auc:.4f}"
    )

# Save model
torch.save(model.state_dict(), "models/cnn_ann_cisplatin.pt")
print("Model saved.")
