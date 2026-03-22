# DNA Drug Vision

An end-to-end machine learning application that predicts cell line responses to drugs (e.g., Cisplatin) based on DNA sequence data. It leverages Convolutional Neural Networks (CNNs) and provides interpretability through Grad-CAM to visualize which base pairs most influenced the prediction.

## Overview

The repository consists of the following structure:
- **`models/`**: PyTorch models for DNA sequence processing.
- **`explainability/`**: Scripts for Grad-CAM visualizations.
- **`preprocessing/`**: Pipeline for preparing datasets from cell lines and one-hot encoding mutations.
- **`api/`**: FastAPI backend to serve model predictions.
- **`frontend/`**: React/Vite web application to provide a user-friendly interface.
- **`experiments/`**: Scripts and strategies used for training and testing.

## Getting Started

You can spin up the full stack (API + Frontend) by simply running:
```bash
./start.sh
```

Ensure you have the required dependencies listed in `api/requirements.txt` and Node.js installed for the frontend.

## License
MIT
