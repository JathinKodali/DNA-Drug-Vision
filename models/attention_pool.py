import torch
import torch.nn as nn

class AttentionPool(nn.Module):
    def __init__(self, embedding_dim):
        super().__init__()

        self.attention = nn.Sequential(
            nn.Linear(embedding_dim, 64),
            nn.Tanh(),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        # x: (num_mutations, embedding_dim)

        scores = self.attention(x)          # (num_mutations, 1)
        weights = torch.softmax(scores, 0)  # attention weights

        pooled = torch.sum(weights * x, dim=0)

        return pooled, weights
    