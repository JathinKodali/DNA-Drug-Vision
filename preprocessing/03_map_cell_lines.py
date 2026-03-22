import pandas as pd

gdsc = pd.read_csv("data/raw/gdsc/sanger-dose-response.csv")
model = pd.read_csv("data/raw/ccle/Model.csv")

# Rename COSMIC column safely
cosmic_col = [c for c in model.columns if "COSMIC" in c.upper()][0]

model = model[[cosmic_col, "ModelID"]]
model.columns = ["COSMIC_ID", "ModelID"]

merged = gdsc.merge(model, on="COSMIC_ID", how="inner")

print("Mapped samples:", merged.shape)
print(merged[["COSMIC_ID", "ModelID"]].head())

merged.to_csv(
    "data/processed/gdsc_modelid_mapping.csv",
    index=False
)
