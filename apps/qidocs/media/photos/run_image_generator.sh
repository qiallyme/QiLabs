#!/bin/bash

echo "============================================"
echo "  AI Stock Image Generator"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python from https://www.python.org/"
    exit 1
fi

# Check if requirements are installed
echo "Checking dependencies..."
python3 -c "import pandas, PIL, requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing required packages..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

echo "Starting application..."
echo ""
python3 stock_image_generator.py

if [ $? -ne 0 ]; then
    echo ""
    echo "Application closed with errors"
    read -p "Press Enter to continue..."
fi

