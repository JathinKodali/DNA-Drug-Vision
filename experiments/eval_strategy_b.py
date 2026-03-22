import sys, os
sys.path.append(os.path.abspath("."))

import torch
import numpy as np
from sklearn.metrics import roc_auc_score

from datasets.cellline_dataset import CellLineDataset
from models.cellline_model import CellLineDrugResponseModel

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

# Dataset
dataset = CellLineDataset(
    "data/processed/training_dataset.csv",
    max_mutations=100
)

model = CellLineDrugResponseModel().to(device)
model.load_state_dict(
    torch.load("models/strategy_b_model.pt", map_location=device)
)
model.eval()

y_true = []
y_pred = []

with torch.no_grad():
    for x, y in dataset:
        x = x.to(device)
        pred, _ = model(x)
        y_true.append(y.item())
        y_pred.append(pred.item())

auc = roc_auc_score(y_true, y_pred)
print(f"Strategy B ROC-AUC: {auc:.4f}")
