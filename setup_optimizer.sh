#!/bin/bash

echo "======================================"
echo "Setting up Displacement Wick Optimizer"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "Python found: $(python3 --version)"

# Create virtual environment (optional but recommended)
echo ""
echo "Creating virtual environment..."
python3 -m venv optimizer_env

# Activate virtual environment
echo "Activating virtual environment..."
source optimizer_env/bin/activate

# Install required packages
echo ""
echo "Installing required packages..."
pip install --upgrade pip
pip install pandas numpy yfinance optuna tqdm

# Optional: Install vectorbt for faster backtesting (can be slow to install)
echo ""
echo "Installing vectorbt (this may take a minute)..."
pip install vectorbt || echo "vectorbt installation failed - will use simple backtester instead"

echo ""
echo "======================================"
echo "Setup complete!"
echo "======================================"
echo ""
echo "To run the optimizer:"
echo "  1. Activate the environment: source optimizer_env/bin/activate"
echo "  2. Run the script: python displacement_wick_optimizer.py"
echo ""
