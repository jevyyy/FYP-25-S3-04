#!/bin/bash

# Quick start script for the backend API
# This script helps set up and run the Flask backend

echo "=================================="
echo "Flask Backend Quick Start"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.10 or higher"
    exit 1
fi

echo "✓ Python is installed: $(python3 --version)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -eq 0 ]; then
        echo "✓ Virtual environment created"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -eq 0 ]; then
    echo "✓ Virtual environment activated"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
echo ""

# Check if requirements are installed
echo "Checking dependencies..."
if ! python3 -c "import flask" &> /dev/null; then
    echo "Installing dependencies... (this may take several minutes)"
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✓ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Check if model files exist
echo "Checking model files..."
MODEL_FILE="../../output_model/flower_img_classifier.keras"
CLASS_FILE="../../output_model/class_names.json"

if [ ! -f "$MODEL_FILE" ]; then
    echo "❌ Error: Model file not found at $MODEL_FILE"
    exit 1
fi

if [ ! -f "$CLASS_FILE" ]; then
    echo "❌ Error: Class names file not found at $CLASS_FILE"
    exit 1
fi

echo "✓ Model files found"
echo ""

# Start the server
echo "=================================="
echo "Starting Flask server..."
echo "=================================="
echo ""
echo "Server will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python3 app.py
