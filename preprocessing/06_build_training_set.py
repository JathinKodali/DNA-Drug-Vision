import pandas as pd
import numpy as np

print("Loading mutation sequences...")
mut = pd.read_csv("data/processed/mutation_sequences_filtered.csv")
print("Mutations shape:", mut.shape)

print("Loading GDSC mapping...")
gdsc = pd.read_csv("data/processed/gdsc_modelid_mapping.csv")
print("GDSC mapping shape:", gdsc.shape)

# Lock drug
DRUG = "CISPLATIN"
gdsc = gdsc[gdsc["DRUG_NAME"] == DRUG]

print("After drug filter:", gdsc.shape)

# Create labels
ic50 = gdsc["IC50_PUBLISHED"]
median_ic50 = ic50.median()

gdsc["label"] = np.where(ic50 <= median_ic50, 1, 0)

gdsc = gdsc[["ModelID", "label"]]
print("Label table shape:", gdsc.shape)

# Merge
dataset = mut.merge(gdsc, on="ModelID", how="inner")

print("FINAL DATASET SHAPE:", dataset.shape)
print(dataset.head())

# 🚨 SAFETY CHECK
assert len(dataset) > 0, "Dataset is EMPTY — stopping save"

dataset.to_csv(
    "data/processed/training_dataset.csv",
    index=False
)

print("Saved training_dataset.csv successfully")
