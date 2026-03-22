import pandas as pd

mut = pd.read_csv("data/processed/mutation_sequences.csv")
drug = pd.read_csv("data/processed/gdsc_modelid_mapping.csv")

# Keep only cell lines with drug response
mut = mut[mut["ModelID"].isin(drug["ModelID"])]

print("Final mutation samples:", mut.shape)

mut.to_csv(
    "data/processed/mutation_sequences_filtered.csv",
    index=False
)
