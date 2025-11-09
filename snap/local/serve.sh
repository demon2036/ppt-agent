#!/bin/bash
# Wrapper script to start HTTP server for presentation preview

set -e

PORT="${PORT:-8000}"
DIR="${1:-.}"

# Change to the presentation directory
cd "$DIR"

echo "Starting HTTP server on port $PORT..."
echo "Open http://localhost:$PORT/index.html in your browser"
echo "Press Ctrl+C to stop"

python3 -m http.server "$PORT"
