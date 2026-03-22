import torch
import torch.nn as nn

from models.cnn_encoder import CNNEncoder
from models.attention_pool import AttentionPool

class CellLineDrugResponseModel(nn.Module):
    def __init__(self, embedding_dim=128):
        super().__init__()

        self.encoder = CNNEncoder(embedding_dim)
        self.attention = AttentionPool(embedding_dim)

        self.classifier = nn.Sequential(
            nn.Linear(embedding_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x: (num_mutations, 4, 51)

        embeddings = self.encoder(x)
        pooled, attn_weights = self.attention(embeddings)

        out = self.classifier(pooled)

        return out.view(-1), attn_weights

