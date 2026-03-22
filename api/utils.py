import torch
import pandas as pd
from datasets.cellline_dataset import CellLineDataset
from models.cellline_model import CellLineDrugResponseModel
from models.cnn_only import CNNOnly

device = "cuda" if torch.cuda.is_available() else "cpu"

DNA_MAP = {
    "A": [1, 0, 0, 0],
    "C": [0, 1, 0, 0],
    "G": [0, 0, 1, 0],
    "T": [0, 0, 0, 1],
}

def encode_dna(seq, max_len=51):
    seq = seq.upper()[:max_len]
    pad = max_len - len(seq)

    arr = [DNA_MAP.get(b, [0,0,0,0]) for b in seq]
    arr += [[0,0,0,0]] * pad

    return torch.tensor(arr, dtype=torch.float).T.unsqueeze(0)

def calibrate(prob, temperature=0.7):
    logit = torch.log(prob / (1 - prob + 1e-8))
    return torch.sigmoid(logit / temperature).item()


# Global caches
_dataset = None
_strategy_b_model = None
_cnn_model = None
_all_scores = None
_cell_line_meta = None

def get_cell_line_metadata():
    """Load Model.csv and return a dict mapping ModelID -> {name, disease}."""
    global _cell_line_meta
    if _cell_line_meta is None:
        try:
            df = pd.read_csv("data/raw/ccle/Model.csv", usecols=["ModelID", "CellLineName", "OncotreePrimaryDisease"])
            _cell_line_meta = {
                row["ModelID"]: {
                    "name": row["CellLineName"] if pd.notna(row["CellLineName"]) else "Unknown",
                    "disease": row["OncotreePrimaryDisease"] if pd.notna(row["OncotreePrimaryDisease"]) else "Unknown",
                }
                for _, row in df.iterrows()
            }
        except Exception:
            _cell_line_meta = {}
    return _cell_line_meta

def get_dataset():
    global _dataset
    if _dataset is None:
        _dataset = CellLineDataset(
            "data/processed/training_dataset.csv",
            max_mutations=100
        )
    return _dataset

def get_strategy_b_model():
    global _strategy_b_model
    if _strategy_b_model is None:
        model = CellLineDrugResponseModel().to(device)
        model.load_state_dict(torch.load("models/strategy_b_model.pt", map_location=device))
        model.eval()
        _strategy_b_model = model
    return _strategy_b_model


def get_all_strategy_b_scores():
    global _all_scores
    if _all_scores is None:
        dataset = get_dataset()
        model = get_strategy_b_model()
        
        scores = []
        with torch.no_grad():
            for i in range(len(dataset)):
                x, _ = dataset[i]
                x = x.to(device)
                pred, _ = model(x)
                scores.append(pred.item())
        _all_scores = scores
    return _all_scores


def get_cnn_model():
    global _cnn_model
    if _cnn_model is None:
        model = CNNOnly().to(device)
        model.load_state_dict(
            torch.load("models/cnn_ann_cisplatin.pt", map_location=device),
            strict=False
        )
        model.eval()
        _cnn_model = model
    return _cnn_model
