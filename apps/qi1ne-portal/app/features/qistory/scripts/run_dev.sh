#!/bin/bash
# Run both backend and frontend in development mode

# Start backend
cd app/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m qibook_api.main &
BACKEND_PID=$!

# Start frontend
cd ../desktop
npm install
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both"

wait

