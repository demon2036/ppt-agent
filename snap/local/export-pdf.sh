#!/bin/bash
# Wrapper script to export presentation to PDF using Chrome Headless

set -e

# Get parameters
PORT="${PORT:-8000}"
HTML="${1:-index.html}"
OUT="${2:-out/$(basename "${HTML%.*}").pdf}"
URL="http://localhost:${PORT}/${HTML}?print-pdf"

# Create output directory
mkdir -p "$(dirname "$OUT")"

# Check if server is running, if not start one
SERVER_RUNNING=0
if lsof -i:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  SERVER_RUNNING=1
  echo "Using existing HTTP server on port ${PORT}"
else
  echo "Starting temporary HTTP server on port ${PORT}..."
  nohup python3 -m http.server "${PORT}" --directory . >/dev/null 2>&1 &
  SRV_PID=$!
  CLEANUP=1

  # Wait for server to be ready
  for i in {1..80}; do
    if curl -fsS "$URL" >/dev/null 2>&1; then break; fi
    sleep 0.1
  done
fi

# Find Chrome/Chromium binary
# Priority order: CHROME_BIN env var > snap chromium > system chromium/chrome
if [ -n "$CHROME_BIN" ]; then
  CHROME="$CHROME_BIN"
elif command -v chromium >/dev/null 2>&1; then
  # This will use snap's chromium if installed via: sudo snap install chromium
  CHROME=chromium
elif command -v chromium-browser >/dev/null 2>&1; then
  CHROME=chromium-browser
elif command -v google-chrome >/dev/null 2>&1; then
  CHROME=google-chrome
elif command -v chrome >/dev/null 2>&1; then
  CHROME=chrome
else
  echo "❌ Error: Chrome/Chromium not found!"
  echo ""
  echo "Please install Chromium using one of the following methods:"
  echo ""
  echo "  1. Via Snap (Recommended):"
  echo "     sudo snap install chromium"
  echo ""
  echo "  2. Via apt (Ubuntu/Debian):"
  echo "     sudo apt install chromium-browser"
  echo ""
  echo "  3. Via Google Chrome:"
  echo "     Download from https://www.google.com/chrome/"
  echo ""
  exit 1
fi

echo "Exporting to PDF using $CHROME..."
echo "URL: $URL"

# Export to PDF
$CHROME --headless=new --disable-gpu --no-sandbox \
    --print-to-pdf="${OUT}" \
    --print-to-pdf-no-header \
    --virtual-time-budget=20000 \
    --run-all-compositor-stages-before-draw \
    ${CHROME_FLAGS} \
    "${URL}" >/dev/null 2>&1

# Cleanup temporary server if we started it
if [[ "${CLEANUP}" == "1" ]]; then
  kill ${SRV_PID} >/dev/null 2>&1 || true
fi

# Show PDF info
if command -v pdfinfo >/dev/null 2>&1; then
  pdfinfo "${OUT}" | grep "Pages\|Page size"
fi

echo ""
echo "✅ Export completed successfully!"
echo "📄 Saved to: ${OUT}"
ls -lh "${OUT}"
