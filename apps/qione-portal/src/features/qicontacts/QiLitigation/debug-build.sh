#!/bin/bash
echo "=== Debug Build Script ==="
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la
echo ""
echo "Contents of public directory:"
ls -la public/ || echo "No public directory found"
echo ""
echo "Contents of src directory:"
ls -la src/ || echo "No src directory found"
echo ""
echo "Package.json location:"
find . -name "package.json" -type f
echo ""
echo "Index.html location:"
find . -name "index.html" -type f
echo ""
echo "Starting npm install..."
npm ci
echo ""
echo "Starting build..."
npm run build