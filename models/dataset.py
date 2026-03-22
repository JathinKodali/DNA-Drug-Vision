import torch
from torch.utils.data import Dataset
import pandas as pd
import numpy as np

class DNADrugResponseDataset(Dataset):
    def __init__(self, csv_path):
        self.data = pd.read_csv(csv_path)

        self.mapping = {
            "A": [1,0,0,0],
            "T": [0,1,0,0],
            "G": [0,0,1,0],
            "C": [0,0,0,1]
        }

    def one_hot(self, seq):
        seq = seq.upper()
        return np.array([self.mapping[n] for n in seq], dtype=np.float32)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        seq = self.data.iloc[idx]["dna_seq"]
        label = self.data.iloc[idx]["label"]

        x = self.one_hot(seq)
        x = torch.tensor(x).permute(1, 0)  # (4, 51)
        y = torch.tensor(label, dtype=torch.float32)

        return x, y
