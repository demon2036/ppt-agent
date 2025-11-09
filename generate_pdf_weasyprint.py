#!/usr/bin/env python3
"""
Generate PDF from HTML using WeasyPrint (no browser required)
"""
import sys
from pathlib import Path
from weasyprint import HTML, CSS

def generate_pdf_weasyprint(url, output_path):
    """
    Generate PDF using WeasyPrint (pure Python, no browser needed)

    Note: WeasyPrint doesn't execute JavaScript, so Reveal.js ?print-pdf
    mode won't work. This generates a static PDF of the HTML.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[WeasyPrint] Fetching {url}...")

    # Custom CSS for print
    print_css = CSS(string='''
        @page {
            size: 1920px 1080px;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }
    ''')

    print(f"[WeasyPrint] Generating PDF...")
    HTML(url).write_pdf(
        str(output_path),
        stylesheets=[print_css]
    )

    print(f"[WeasyPrint] ✓ Saved to {output_path}")
    print(f"[WeasyPrint] File size: {output_path.stat().st_size / 1024:.1f} KB")

    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 generate_pdf_weasyprint.py <url> <output_path>")
        print("Example: python3 generate_pdf_weasyprint.py 'http://localhost:8000/example2/index.html' out/index.pdf")
        sys.exit(1)

    url = sys.argv[1]
    output = sys.argv[2]

    generate_pdf_weasyprint(url, output)
