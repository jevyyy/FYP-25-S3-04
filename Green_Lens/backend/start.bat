@echo off
REM Backend Startup Script for Windows
REM This script sets up and starts the Python backend API

echo ======================================
echo Plant Recognition Backend API
echo ======================================
echo.

REM Check if Python 3 is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python 3 is not installed
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo Python 3 is installed
python --version
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo Virtual environment activated
echo.

REM Check if dependencies are installed
if not exist "venv\.dependencies_installed" (
    echo Installing dependencies (this may take a few minutes)...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    
    if %errorlevel% equ 0 (
        type nul > venv\.dependencies_installed
        echo Dependencies installed successfully
    ) else (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
) else (
    echo Dependencies already installed
    echo.
)

REM Start the Flask application
echo Starting Flask API server...
echo The server will run on http://localhost:5000
echo.
echo Available endpoints:
echo   GET  /health   - Check API health
echo   POST /predict  - Predict plant from image
echo   GET  /classes  - Get all plant classes
echo.
echo Press Ctrl+C to stop the server
echo ======================================
echo.

cd src
python app.py
