/**
 * Reveal Presentation Loader
 * Smart, minimal slide loader with manifest support
 * @version 1.0.0
 */

class PresentationLoader {
  constructor(config = {}) {
    this.config = {
      slidesDir: 'slides',
      manifestFile: 'manifest.json',
      slidesContainer: 'slides-root',
      revealConfig: {},
      ...config
    };
  }

  /**
   * Load manifest.json
   */
  async loadManifest() {
    const url = `${this.config.slidesDir}/${this.config.manifestFile}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load manifest: ${url}`);
    return res.json();
  }

  /**
   * Load individual slide HTML
   */
  async loadSlide(filename) {
    const url = `${this.config.slidesDir}/${filename}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load slide: ${url}`);
    return res.text();
  }

  /**
   * Inject slides into DOM
   */
  injectSlides(slides) {
    const container = document.getElementById(this.config.slidesContainer);
    if (!container) throw new Error(`Container #${this.config.slidesContainer} not found`);

    slides.forEach(html => {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      container.appendChild(template.content);
    });
  }

  /**
   * Display error message
   */
  showError(error) {
    const container = document.getElementById(this.config.slidesContainer);
    if (!container) return;

    container.innerHTML = `
      <section>
        <h2>加载失败</h2>
        <p>${error.message}</p>
        <p style="font-size: 0.9em; margin-top: 2em;">
          <strong>提示：</strong>直接用浏览器打开本页时，可能禁止 fetch 本地文件。<br>
          请运行 <code>python3 -m http.server 8000</code> 并访问 <code>http://localhost:8000/</code>
        </p>
      </section>
    `;
  }

  /**
   * Initialize presentation
   */
  async init() {
    try {
      const params = new URLSearchParams(location.search);
      const mParam = params.get('m');
      if (mParam) {
        const v = Math.max(0, Math.min(0.2, parseFloat(mParam)));
        this.config.revealConfig.margin = v;
      }
      // Load manifest
      const manifest = await this.loadManifest();

      // Load all slides in parallel
      const slidePromises = manifest.map(item => this.loadSlide(item.file));
      const slides = await Promise.all(slidePromises);

      // Inject into DOM
      this.injectSlides(slides);

      // Initialize Reveal.js
      Reveal.initialize(this.config.revealConfig);

    } catch (error) {
      console.error('Presentation loading failed:', error);
      this.showError(error);
    }
  }
}

/**
 * Default Reveal.js configuration factory
 */
function createRevealConfig(overrides = {}) {
  return {
    hash: true,
    slideNumber: 'c/t',
    width: 1920,
    height: 1080,
    margin: 0.08,
    minScale: 0.2,
    maxScale: 2.0,
    transition: 'slide',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    pdfMaxPagesPerSlide: 1,
    pdfSeparateFragments: false,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes, RevealMath.KaTeX],
    math: {
      mathjax: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
      config: 'TeX-AMS_HTML-full',
      TeX: { Macros: { RR: '{\\bf R}', bold: ['{\\bf #1}', 1] } }
    },
    ...overrides
  };
}

/**
 * Quick init function for simple usage
 */
async function initPresentation(config = {}) {
  const loader = new PresentationLoader({
    revealConfig: createRevealConfig(config.reveal),
    ...config
  });
  await loader.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PresentationLoader, createRevealConfig, initPresentation };
}
