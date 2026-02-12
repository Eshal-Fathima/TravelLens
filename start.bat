@echo off
REM TravelLens Startup Script for Windows

echo 🌍 Starting TravelLens Application...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Start Backend
echo 🔧 Starting Flask Backend...
cd backend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy ".env.example" ".env"
    echo ⚠️ Please update the .env file with your database credentials
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Start Flask server
echo ✅ Starting backend on http://localhost:5000
start "Flask Backend" cmd /k "flask run"

REM Start Frontend
echo 🎨 Starting React Frontend...
cd ..\frontend

REM Install Node dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy ".env.example" ".env"
)

REM Start React dev server
echo ✅ Starting frontend on http://localhost:5173
start "React Frontend" cmd /k "npm run dev"

echo.
echo 🚀 TravelLens is now running!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:5000
echo.
echo Close this window to stop the servers
pause
