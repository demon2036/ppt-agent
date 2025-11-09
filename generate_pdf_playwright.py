#!/usr/bin/env python3
"""
Generate PDF from Reveal.js presentation using Playwright
"""
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def generate_pdf(url, output_path, wait_time=5000):
    """
    Generate PDF from a URL using Playwright

    Args:
        url: URL to convert (should include ?print-pdf)
        output_path: Path to save PDF
        wait_time: Time to wait for page load in milliseconds
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        print(f"[PDF] Launching browser...")
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )

        page = browser.new_page()

        print(f"[PDF] Loading {url}...")
        try:
            page.goto(url, wait_until='load', timeout=30000)
        except Exception as e:
            print(f"[PDF] Warning: {e}")
            print(f"[PDF] Continuing anyway...")

        # Wait for Reveal.js to be ready
        print(f"[PDF] Waiting for Reveal.js initialization...")
        try:
            page.wait_for_function("window.Reveal && Reveal.isReady()", timeout=10000)
        except Exception:
            print(f"[PDF] Warning: Reveal.js check failed, proceeding anyway...")

        # Additional wait for rendering
        time.sleep(wait_time / 1000)

        print(f"[PDF] Generating PDF...")
        page.pdf(
            path=str(output_path),
            width='1920px',
            height='1080px',
            print_background=True,
            prefer_css_page_size=True,
        )

        browser.close()

    print(f"[PDF] ✓ Saved to {output_path}")
    print(f"[PDF] File size: {output_path.stat().st_size / 1024:.1f} KB")

    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 generate_pdf_playwright.py <url> <output_path> [wait_time_ms]")
        print("Example: python3 generate_pdf_playwright.py 'http://localhost:8000/example2/index.html?print-pdf' out/index.pdf 5000")
        sys.exit(1)

    url = sys.argv[1]
    output = sys.argv[2]
    wait_time = int(sys.argv[3]) if len(sys.argv) > 3 else 5000

    # Ensure URL has print-pdf parameter
    if '?print-pdf' not in url and '&print-pdf' not in url:
        if '?' in url:
            url += '&print-pdf'
        else:
            url += '?print-pdf'
        print(f"[PDF] Added ?print-pdf parameter: {url}")

    generate_pdf(url, output, wait_time)
