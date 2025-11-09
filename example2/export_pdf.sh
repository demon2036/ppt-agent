#!/bin/bash
# PDF Export Script for Tailwind CSS Presentation

cd "$(dirname "$0")"

PORT="${PORT:-8000}"
HTML="${1:-index.html}"
OUT="${2:-out/$(basename "${HTML%.*}").pdf}"
URL="http://localhost:${PORT}/example2/${HTML}?print-pdf"

mkdir -p "$(dirname "$OUT")"

# Start HTTP server if not running
if ! lsof -i:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[export] Starting HTTP server on port ${PORT}..."
  cd ..
  nohup python3 -m http.server "${PORT}" --directory . >/dev/null 2>&1 &
  SRV_PID=$!
  CLEANUP=1
  cd example2
fi

# Wait for server to be ready
echo "[export] Waiting for server..."
for i in {1..80}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then break; fi
  sleep 0.1
done

echo "[export] Generating PDF from ${URL}..."

# Export to PDF using Chrome
google-chrome --headless=new --disable-gpu --no-sandbox \
    --print-to-pdf="${OUT}" \
    --print-to-pdf-no-header \
    --virtual-time-budget=20000 \
    --run-all-compositor-stages-before-draw \
    "${URL}" >/dev/null 2>&1

# Cleanup server if we started it
if [[ "${CLEANUP}" == "1" ]]; then
  kill ${SRV_PID} >/dev/null 2>&1 || true
fi

# Output info
if command -v pdfinfo >/dev/null 2>&1; then
  echo "[export] PDF Info:"
  pdfinfo "${OUT}" | grep "Pages\|Page size"
fi

echo "[export] ✓ Saved -> ${OUT}"
ls -lh "${OUT}"
