import torch
import torch.nn as nn
import torch.nn.functional as F

class CNN_ANN(nn.Module):
    def __init__(self):
        super().__init__()

        # CNN = motif detector
        self.conv1 = nn.Conv1d(4, 32, kernel_size=8)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=8)

        self.pool = nn.MaxPool1d(2)
        self.dropout = nn.Dropout(0.5)

        # 🔥 FIXED DIMENSION
        self.fc1 = nn.Linear(64 * 7, 128)
        self.fc2 = nn.Linear(128, 1)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = self.pool(x)

        x = F.relu(self.conv2(x))
        x = self.pool(x)

        x = x.view(x.size(0), -1)  # flatten

        x = self.dropout(F.relu(self.fc1(x)))
        x = torch.sigmoid(self.fc2(x))

        return x.squeeze()
