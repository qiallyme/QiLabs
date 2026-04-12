#!/bin/bash
# Quick test runner for QiOS Local Core

set -e

echo "=========================================="
echo "QiOS Local Core - Test Suite"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "qios_local_core.py" ]; then
    echo "Error: Must run from workers/local_core directory"
    exit 1
fi

# Check Python
if ! command -v python &> /dev/null; then
    echo "Error: Python not found"
    exit 1
fi

# Check dependencies
echo "Checking dependencies..."
python -c "import httpx" 2>/dev/null || { echo "Error: httpx not installed"; exit 1; }
python -c "import supabase" 2>/dev/null || { echo "Warning: supabase-py not installed (some tests will skip)"; }

# Run tests
echo ""
echo "Running sanity checks..."
python tests/test_sanity_checks.py

echo ""
echo "=========================================="
echo "Tests complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review test results above"
echo "2. Run manual failure mode tests (see tests/test_manual_failures.md)"
echo "3. Check Supabase SQL sanity (see tests/test_db_sanity.sql)"

