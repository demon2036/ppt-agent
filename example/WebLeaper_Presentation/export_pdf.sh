#!/usr/bin/env bash
set -euo pipefail

# Export a reveal.js deck to PDF in 16:9 using headless Chrome.
# Usage: ./export_pdf.sh [html=index.html] [out=out/<name>.pdf]

cd "$(dirname "$0")"

PORT="${PORT:-8000}"
HTML="${1:-index.html}"
OUT="${2:-out/$(basename "${HTML%.*}").pdf}"
# Engine: auto|chrome|decktape (env var ENGINE or 3rd arg)
ENGINE="${ENGINE:-${3:-auto}}"

# Detect if running from subdirectory and adjust URL
SUBDIR="$(basename "$(pwd)")"
BASE_URL="http://localhost:${PORT}/${SUBDIR}/${HTML}"
URL="${BASE_URL}?print-pdf"
# Optional: override reveal margin via URL (?m=0.10)
if [[ -n "${MARGIN:-}" ]]; then
  URL="${URL}&m=${MARGIN}"
  BASE_URL_M="${BASE_URL}?m=${MARGIN}"
else
  BASE_URL_M="${BASE_URL}"
fi
# Optional: override reveal margin via URL (?m=0.10)
if [[ -n "${MARGIN:-}" ]]; then
  URL="${URL}&m=${MARGIN}"
fi

mkdir -p "$(dirname "$OUT")"

# Start lightweight HTTP server if port not in use
if ! lsof -i:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  nohup python3 -m http.server "${PORT}" --directory . >/dev/null 2>&1 &
  SRV_PID=$!
  CLEANUP=1
else
  CLEANUP=0
fi

# Wait for server to respond
for i in {1..80}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then break; fi
  sleep 0.1
done

# Pick headless variant
if google-chrome --version 2>/dev/null | grep -qE "(118|119|1[2-9][0-9])"; then
  HEADLESS_FLAG="--headless=new"
else
  HEADLESS_FLAG="--headless"
fi

echo "[export] Printing to $OUT from $BASE_URL"

# Calibrated DeckTape viewport to yield 1554.96×875.04 pts (≈21.6×12.15 in @72dpi)
# math: pts = px * 72/96 → px = pts * 96/72 = 1.333... × pts
# Default calibrated viewport for DeckTape to match Chrome's 1554.96×875.04 pts
DECKTAPE_SIZE="${DECKTAPE_SIZE:-2073x1166}"

run_chrome() {
  echo "[export] Using Chrome headless print-to-pdf"
  google-chrome ${HEADLESS_FLAG} --disable-gpu --no-sandbox \
    --print-to-pdf="${OUT}" \
    --print-to-pdf-no-header \
    --virtual-time-budget=20000 \
    --run-all-compositor-stages-before-draw \
    "${URL}" >/dev/null 2>&1
}

run_decktape() {
  echo "[export] Using DeckTape size=${DECKTAPE_SIZE}"
  npx --yes decktape --chrome-arg=--no-sandbox --size "${DECKTAPE_SIZE}" --load-pause 5000 reveal "${BASE_URL_M}" "${OUT}"
}

case "${ENGINE}" in
  chrome)
    run_chrome || { echo "[export] Chrome failed"; exit 1; }
    ;;
  decktape)
    run_decktape || { echo "[export] DeckTape failed"; exit 1; }
    ;;
  *)
    if command -v google-chrome >/dev/null 2>&1; then
      run_chrome || { echo "[export] Chrome export failed; falling back to DeckTape"; run_decktape; }
    else
      echo "[export] Chrome not found; using DeckTape"
      run_decktape
    fi
    ;;
esac

if [[ "${CLEANUP}" == "1" ]]; then
  # Best-effort cleanup
  pkill -P ${SRV_PID} >/dev/null 2>&1 || true
  kill ${SRV_PID} >/dev/null 2>&1 || true
fi

# Quick summary
if command -v pdfinfo >/dev/null 2>&1; then
  pdfinfo "${OUT}" | sed -n 's/^Pages:/Pages:/p; s/^Page size:/Page size:/p'
fi
echo "[export] Saved -> ${OUT}"
