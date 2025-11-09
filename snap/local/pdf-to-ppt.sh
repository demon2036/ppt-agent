#!/bin/bash
# Wrapper script to convert PDF to PowerPoint format

set -e

PDF_FILE="${1}"
OUTPUT_FILE="${2}"

if [ -z "$PDF_FILE" ]; then
  echo "Usage: ppt-agent.pdf-to-ppt <pdf_file> [output_file]"
  echo ""
  echo "Arguments:"
  echo "  pdf_file     Input PDF file path"
  echo "  output_file  Output PPT file path (optional, defaults to same name with .pptx)"
  echo ""
  echo "Options:"
  echo "  --dpi DPI    Image DPI (default: 200)"
  exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
  echo "Error: PDF file not found: $PDF_FILE"
  exit 1
fi

# Find the pdf_to_ppt.py script
SCRIPT="$SNAP/reveal-presentation-core/tools/pdf_to_ppt.py"

if [ ! -f "$SCRIPT" ]; then
  echo "Error: Conversion script not found: $SCRIPT"
  exit 1
fi

# Run the conversion
if [ -n "$OUTPUT_FILE" ]; then
  python3 "$SCRIPT" "$PDF_FILE" "$OUTPUT_FILE"
else
  python3 "$SCRIPT" "$PDF_FILE"
fi
