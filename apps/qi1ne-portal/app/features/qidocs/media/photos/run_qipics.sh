#!/bin/bash

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Please run: ./setup_venv.sh first"
    echo ""
    read -p "Press Enter to continue..."
    exit 1
fi

# Activate venv and run app
source venv/bin/activate
python app.py

# Keep terminal open if error occurs
if [ $? -ne 0 ]; then
    echo ""
    echo "Application closed with errors"
    read -p "Press Enter to continue..."
fi

