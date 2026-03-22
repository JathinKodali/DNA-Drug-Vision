import torch
import torch.nn as nn
import torch.nn.functional as F

class CNNEncoder(nn.Module):
    def __init__(self, embedding_dim=128):
        super().__init__()

        self.conv1 = nn.Conv1d(4, 32, kernel_size=8)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=8)

        self.pool = nn.MaxPool1d(2)

        self.fc = nn.Linear(64 * 7, embedding_dim)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = self.pool(x)

        x = F.relu(self.conv2(x))
        x = self.pool(x)

        x = x.view(x.size(0), -1)
        x = self.fc(x)

        return x  # (num_mutations, embedding_dim)
