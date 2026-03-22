import torch
import numpy as np
import matplotlib.pyplot as plt

from models.cnn_ann import CNN_ANN
from models.dataset import DNADrugResponseDataset
from explainability.grad_cam import GradCAM

# --------------------
# Setup
# --------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

# Load model
model = CNN_ANN().to(device)
model.load_state_dict(torch.load("models/cnn_ann_cisplatin.pt", map_location=device))
model.eval()

# Dataset
dataset = DNADrugResponseDataset("data/processed/training_subset.csv")

# Grad-CAM object (use conv2)
cam_generator = GradCAM(model, model.conv2)

# --------------------
# Helper: upscale CAM to 51 bp
# --------------------
def upscale_cam(cam, target_len=51):
    return np.interp(
        np.linspace(0, len(cam) - 1, target_len),
        np.arange(len(cam)),
        cam
    )

# ==========================================================
# 1️⃣ SINGLE SAMPLE GRAD-CAM (51 bp)
# ==========================================================
x, y = dataset[0]
x = x.unsqueeze(0).to(device)

cam = cam_generator.generate(x)
cam_51 = upscale_cam(cam)

plt.figure(figsize=(12,3))
plt.plot(cam_51)
plt.title("DNA Position Importance (Grad-CAM, 51 bp)")
plt.xlabel("DNA Position")
plt.ylabel("Importance")
plt.tight_layout()
plt.savefig("explainability/gradcam_single_51bp.png", dpi=300)
plt.show()

# ==========================================================
# 2️⃣ AVERAGE GRAD-CAM OVER MANY SAMPLES
# ==========================================================
cams = []

N = 100  # number of samples to average
for i in range(N):
    x, _ = dataset[i]
    x = x.unsqueeze(0).to(device)
    cam = cam_generator.generate(x)
    cam_51 = upscale_cam(cam)
    cams.append(cam_51)

avg_cam = np.mean(cams, axis=0)

plt.figure(figsize=(12,3))
plt.plot(avg_cam)
plt.title(f"Average DNA Importance (Grad-CAM, {N} samples)")
plt.xlabel("DNA Position")
plt.ylabel("Importance")
plt.tight_layout()
plt.savefig("explainability/gradcam_average.png", dpi=300)
plt.show()

# ==========================================================
# 3️⃣ RESPONDER vs NON-RESPONDER COMPARISON
# ==========================================================
cams_resp = []
cams_non = []

M = 200  # samples to scan
for i in range(M):
    x, label = dataset[i]
    x = x.unsqueeze(0).to(device)
    cam = cam_generator.generate(x)
    cam_51 = upscale_cam(cam)

    if label.item() == 1:
        cams_resp.append(cam_51)
    else:
        cams_non.append(cam_51)

if len(cams_resp) > 0 and len(cams_non) > 0:
    resp_mean = np.mean(cams_resp, axis=0)
    non_mean = np.mean(cams_non, axis=0)

    plt.figure(figsize=(12, 3))
    plt.plot(resp_mean, label="Responders", linewidth=2)
    plt.plot(non_mean, label="Non-Responders", linewidth=2)
    plt.legend()
    plt.title("Grad-CAM: Responders vs Non-Responders")
    plt.xlabel("DNA Position")
    plt.ylabel("Importance")
    plt.tight_layout()
    plt.savefig("explainability/gradcam_responder_vs_non.png", dpi=300)
    plt.show()
else:
    print("Not enough samples for responder/non-responder comparison.")
