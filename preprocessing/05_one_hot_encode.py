import pandas as pd
import numpy as np

mut = pd.read_csv("data/processed/mutation_sequences_filtered.csv")

mapping = {
    "A": [1,0,0,0],
    "T": [0,1,0,0],
    "G": [0,0,1,0],
    "C": [0,0,0,1]
}

def one_hot(seq):
    seq = seq.upper()  # 🔥 FIX HERE
    return np.array([mapping[n] for n in seq])

X = np.stack(mut["dna_seq"].apply(one_hot))

print("DNA tensor shape:", X.shape)
