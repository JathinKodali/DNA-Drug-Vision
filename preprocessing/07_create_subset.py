import pandas as pd

df = pd.read_csv("data/processed/training_dataset.csv")

# Take a balanced subset (example: 200k samples)
subset = df.groupby("label", group_keys=False).apply(
    lambda x: x.sample(min(len(x), 100_000), random_state=42)
)

print("Subset shape:", subset.shape)
print(subset["label"].value_counts())

subset.to_csv(
    "data/processed/training_subset.csv",
    index=False
)
