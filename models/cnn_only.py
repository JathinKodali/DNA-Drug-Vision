import torch
import torch.nn as nn
import torch.nn.functional as F

class CNNOnly(nn.Module):
    def __init__(self):
        super().__init__()

        # MUST MATCH cnn_ann.py EXACTLY
        self.conv1 = nn.Conv1d(4, 32, kernel_size=8)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=8)

        self.pool = nn.AdaptiveMaxPool1d(1)
        self.fc = nn.Linear(64, 1)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = self.pool(x).squeeze(-1)
        return torch.sigmoid(self.fc(x))
