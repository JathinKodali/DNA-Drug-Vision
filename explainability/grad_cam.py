import torch
import numpy as np

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Hooks
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, x):
        self.model.zero_grad()

        output = self.model(x)
        output.backward(torch.ones_like(output))

        # Global average pooling over sequence dimension
        weights = self.gradients.mean(dim=2)

        cam = torch.zeros(self.activations.shape[2], device=x.device)
        for i, w in enumerate(weights[0]):
            cam += w * self.activations[0, i]

        cam = cam.cpu().numpy()
        cam = np.maximum(cam, 0)
        cam = cam / (cam.max() + 1e-8)

        return cam
