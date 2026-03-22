from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import sys
import os

# Add parent directory to path to reach models/ and datasets/
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from api.utils import (
    device,
    encode_dna,
    calibrate,
    get_dataset,
    get_strategy_b_model,
    get_cnn_model,
    get_all_strategy_b_scores,
    get_cell_line_metadata,
)

app = FastAPI(
    title="DNA Drug Response API",
    description="API for predicting drug response using cancer cell line DNA data."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # Pre-load datasets and models into memory when the server starts
    print("Preloading datasets and models...")
    get_dataset()
    get_strategy_b_model()
    get_cnn_model()
    get_all_strategy_b_scores()
    print("Preloading complete.")


class CellLineRequest(BaseModel):
    model_id: str

class DNARequest(BaseModel):
    dna_sequence: str


@app.get("/cell_lines")
def get_cell_lines():
    """Returns a list of all available cell lines with metadata."""
    dataset = get_dataset()
    meta = get_cell_line_metadata()
    cell_lines = []
    for mid in dataset.model_ids:
        info = meta.get(mid, {})
        cell_lines.append({
            "model_id": mid,
            "name": info.get("name", "Unknown"),
            "disease": info.get("disease", "Unknown"),
        })
    return {"cell_lines": cell_lines}


@app.post("/predict/cellline")
def predict_cellline(req: CellLineRequest):
    """Predicts sensitivity for a specific cell line (Strategy B)."""
    dataset = get_dataset()
    if req.model_id not in dataset.model_ids:
        raise HTTPException(status_code=404, detail="Cell line ModelID not found")
        
    idx = dataset.model_ids.index(req.model_id)
    x, _ = dataset[idx]
    x = x.to(device)

    model = get_strategy_b_model()
    
    with torch.no_grad():
        pred, attn_weights = model(x)

    prob = pred.item()
    all_scores = get_all_strategy_b_scores()
    sorted_scores = sorted(all_scores)

    # Calculate Ranking
    rank_index = sorted_scores.index(prob)
    percentile = 100 * (1 - rank_index / len(sorted_scores))
    
    # Format attention for JSON
    attn = attn_weights.cpu().numpy().squeeze().tolist()

    meta = get_cell_line_metadata()
    info = meta.get(req.model_id, {})

    return {
        "model_id": req.model_id,
        "cell_line_name": info.get("name", "Unknown"),
        "disease": info.get("disease", "Unknown"),
        "probability": prob,
        "percentile_rank": round(percentile, 2),
        "attention_weights": attn
    }


@app.post("/predict/dna")
def predict_dna(req: DNARequest):
    """Predicts sensitivity for a custom DNA sequence (Strategy A)."""
    seq = req.dna_sequence.strip().upper()
    if len(seq) < 10:
        raise HTTPException(status_code=400, detail="DNA Sequence must be at least 10 bases")
        
    if not all(base in "ATGC" for base in seq):
        raise HTTPException(status_code=400, detail="DNA Sequence can only contain A, T, G, C")

    x = encode_dna(seq).to(device)
    model = get_cnn_model()

    with torch.no_grad():
        raw_prob = model(x).squeeze()
        calibrated_prob = calibrate(raw_prob)

    return {
        "sequence_preview": seq[:20] + "..." if len(seq) > 20 else seq,
        "sensitivity_score": calibrated_prob
    }
