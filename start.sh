#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")"

echo "=================================================="
echo "    🧪 Starting DNA Drug Response Predictor    "
echo "=================================================="

# 1. Start the FastAPI backend
echo "Starting FastAPI Backend on port 8000..."
./venv/bin/uvicorn api.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for the backend to initialize
sleep 2

# 2. Start the React Frontend
echo "Starting Vite Frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "=================================================="
echo "✅ Both servers are running!"
echo "➡️ Access the application at: http://localhost:5173"
echo "Press CTRL+C to stop both servers."
echo "=================================================="

# Wait for user to stop the script
wait

# Cleanup function when user presses CTRL+C
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
