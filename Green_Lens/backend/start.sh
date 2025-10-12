#!/bin/bash

# Backend Startup Script
# This script sets up and starts the Python backend API

echo "======================================"
echo "Plant Recognition Backend API"
echo "======================================"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "✓ Python 3 is installed"
python3 --version
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Check if dependencies are installed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo "Installing dependencies (this may take a few minutes)..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        touch venv/.dependencies_installed
        echo "✓ Dependencies installed successfully"
    else
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Start the Flask application
echo "Starting Flask API server..."
echo "The server will run on http://localhost:5000"
echo ""
echo "Available endpoints:"
echo "  GET  /health   - Check API health"
echo "  POST /predict  - Predict plant from image"
echo "  GET  /classes  - Get all plant classes"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"
echo ""

cd src
python app.py
