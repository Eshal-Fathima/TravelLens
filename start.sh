#!/bin/bash

# TravelLens Startup Script
echo "🌍 Starting TravelLens Application..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "⚠️  MySQL is not running. Please start MySQL first."
    exit 1
fi

# Start Backend
echo "🔧 Starting Flask Backend..."
cd backend
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your database credentials"
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Start Flask server in background
flask run &
BACKEND_PID=$!
echo "✅ Backend started on http://localhost:5000 (PID: $BACKEND_PID)"

# Start Frontend
echo "🎨 Starting React Frontend..."
cd ../frontend

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Start React dev server
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started on http://localhost:5173 (PID: $FRONTEND_PID)"

echo ""
echo "🚀 TravelLens is now running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt signal
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
