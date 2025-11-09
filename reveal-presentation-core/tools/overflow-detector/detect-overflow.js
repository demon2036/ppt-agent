#!/usr/bin/env node
/**
 * Overflow Detector for Reveal.js Presentations
 *
 * 检测每一页幻灯片是否有内容溢出（overflow）
 * 使用 Puppeteer 模拟真实浏览器渲染
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  url: 'http://localhost:8000/WebLeaper_Presentation/index.html',
  width: 1920,
  height: 1080,
  waitTime: 1000, // 等待每页渲染的时间（毫秒）
  outputFile: 'overflow-report.json'
};

// 允许通过环境变量或命令行参数覆盖 URL
// 用法示例：
//   URL=http://localhost:8000/WebLeaper_Presentation/index_modular.html node detect-overflow.js
//   node detect-overflow.js http://localhost:8000/WebLeaper_Presentation/index_modular.html
// 可选环境变量：MARGIN=0.10 （等效添加 ?m=0.10）
(() => {
  const cliUrl = process.env.URL || process.argv[2];
  const m = process.env.MARGIN;
  if (cliUrl) CONFIG.url = cliUrl;
  if (m && !/([?&])m=/.test(CONFIG.url)) {
    CONFIG.url += (CONFIG.url.includes('?') ? '&' : '?') + `m=${m}`;
  }
})();

/**
 * 检测单个幻灯片是否有 overflow（更稳健版本）
 * - 使用 Reveal.getCurrentSlide() 精确获取当前页
 * - 等待图片/字体加载完成，避免测量抖动
 * - 同时采用 scroll 尺寸与可视边界（bounding box）两种方法交叉验证
 */
async function detectOverflow(page) {
  const result = await page.evaluate(async () => {
    const EPS = 2; // 容差，像素

    // 1) 获取当前页
    const slide = (window.Reveal && window.Reveal.getCurrentSlide)
      ? window.Reveal.getCurrentSlide()
      : document.querySelector('.reveal .slides section.present');
    if (!slide) return { error: 'No slide found' };

    // 2) 等待图片和字体
    const imgs = Array.from(slide.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(res => {
          img.addEventListener('load', () => res(), { once: true });
          img.addEventListener('error', () => res(), { once: true });
        });
      })
    );
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (_) {}
    }

    // 3) 标题
    const titleEl = slide.querySelector('h1, h2, h3');
    const title = titleEl ? titleEl.textContent.trim() : 'Untitled';

    // 4) scroll 基准检测
    const hasVerticalOverflowScroll = slide.scrollHeight - slide.clientHeight > EPS;
    const hasHorizontalOverflowScroll = slide.scrollWidth - slide.clientWidth > EPS;
    const scrollVerticalPx = Math.max(0, slide.scrollHeight - slide.clientHeight);
    const scrollHorizontalPx = Math.max(0, slide.scrollWidth - slide.clientWidth);

    // 5) 可视区域（bounding box）检测
    const slideRect = slide.getBoundingClientRect();
    // 只统计可见元素，忽略备注等
    const visibleNodes = Array.from(slide.querySelectorAll('*'))
      .filter(el => !el.closest('aside.notes'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        const visible = style.visibility !== 'hidden' && style.display !== 'none';
        const inDocFlow = el.getClientRects().length > 0;
        return visible && inDocFlow;
      });

    let contentTop = Infinity, contentLeft = Infinity, contentRight = -Infinity, contentBottom = -Infinity;
    for (const el of visibleNodes) {
      const r = el.getBoundingClientRect();
      contentTop = Math.min(contentTop, r.top);
      contentLeft = Math.min(contentLeft, r.left);
      contentRight = Math.max(contentRight, r.right);
      contentBottom = Math.max(contentBottom, r.bottom);
    }

    // 若页面为空，回退为 0
    if (contentTop === Infinity) {
      contentTop = slideRect.top; contentLeft = slideRect.left;
      contentRight = slideRect.right; contentBottom = slideRect.bottom;
    }

    const overflowTopPx = Math.max(0, slideRect.top - contentTop);
    const overflowLeftPx = Math.max(0, slideRect.left - contentLeft);
    const overflowRightPx = Math.max(0, contentRight - slideRect.right);
    const overflowBottomPx = Math.max(0, contentBottom - slideRect.bottom);

    const bboxVerticalPx = Math.ceil(Math.max(overflowTopPx, overflowBottomPx));
    const bboxHorizontalPx = Math.ceil(Math.max(overflowLeftPx, overflowRightPx));

    const hasVerticalOverflowBBox = bboxVerticalPx > EPS;
    const hasHorizontalOverflowBBox = bboxHorizontalPx > EPS;

    // 6) 汇总
    const hasOverflow =
      hasVerticalOverflowScroll || hasHorizontalOverflowScroll ||
      hasVerticalOverflowBBox || hasHorizontalOverflowBBox;

    const overflowAmount = {
      vertical: Math.max(scrollVerticalPx, bboxVerticalPx),
      horizontal: Math.max(scrollHorizontalPx, bboxHorizontalPx)
    };

    const overflowStyle = window.getComputedStyle(slide);
    const revealInfo = (window.Reveal && window.Reveal.getComputedSlideSize)
      ? window.Reveal.getComputedSlideSize()
      : null;
    const scale = (window.Reveal && window.Reveal.getScale) ? window.Reveal.getScale() : null;

    return {
      title,
      rect: { width: slideRect.width, height: slideRect.height },
      scroll: { height: slide.scrollHeight, width: slide.scrollWidth },
      client: { height: slide.clientHeight, width: slide.clientWidth },
      overflow: {
        vertical: hasVerticalOverflowScroll || hasVerticalOverflowBBox,
        horizontal: hasHorizontalOverflowScroll || hasHorizontalOverflowBBox,
        y: overflowStyle.overflowY,
        x: overflowStyle.overflowX,
        methods: {
          scroll: { v: hasVerticalOverflowScroll, h: hasHorizontalOverflowScroll },
          bbox: { v: hasVerticalOverflowBBox, h: hasHorizontalOverflowBBox }
        }
      },
      hasOverflow,
      overflowAmount,
      reveal: { computedSize: revealInfo, scale }
    };
  });

  return result;
}

/**
 * 获取幻灯片总数
 */
async function getAllSlideIndices(page) {
  return await page.evaluate(() => {
    if (!window.Reveal) return [];
    // 使用 Reveal API 枚举全部 slide 的坐标 (h, v)
    const slides = window.Reveal.getSlides ? window.Reveal.getSlides() : [];
    return Array.from(slides).map(s => {
      const { h, v } = window.Reveal.getIndices(s);
      const titleEl = s.querySelector('h1, h2, h3');
      return { h, v, title: titleEl ? titleEl.textContent.trim() : 'Untitled' };
    });
  });
}

/**
 * 导航到指定幻灯片
 */
async function navigateToSlide(page, indices) {
  await page.evaluate(({ h, v }) => {
    if (window.Reveal && window.Reveal.slide) {
      window.Reveal.slide(h, v || 0);
    }
  }, indices);

  // 等待 Reveal 认为已渲染 & 当前索引匹配
  await page.waitForFunction(({ h, v }) => {
    if (!window.Reveal) return false;
    const cur = window.Reveal.getIndices();
    return cur.h === h && (cur.v || 0) === (v || 0);
  }, { timeout: 15000 }, indices);

  // 额外等待内容加载与布局稳定
  await page.evaluate(async () => {
    const slide = window.Reveal.getCurrentSlide();
    if (!slide) return;
    const imgs = Array.from(slide.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise(res => {
          img.addEventListener('load', () => res(), { once: true });
          img.addEventListener('error', () => res(), { once: true });
        });
      })
    );
  });

  await new Promise(resolve => setTimeout(resolve, CONFIG.waitTime));
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 启动 Overflow 检测器...\n');
  console.log(`目标 URL: ${CONFIG.url}`);
  console.log(`视口尺寸: ${CONFIG.width}x${CONFIG.height}\n`);

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: CONFIG.width,
    height: CONFIG.height
  });

  try {
    // 加载页面
    console.log('📄 加载演示文稿...');
    await page.goto(CONFIG.url, {
      waitUntil: 'load',
      timeout: 60000
    });

    // 等待 Reveal.js 初始化
    await page.waitForFunction(() => window.Reveal && window.Reveal.isReady(), {
      timeout: 30000
    });

    // 额外等待确保所有幻灯片加载完成
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 通过 Reveal API 获取所有 slide 坐标
    const slideIndices = await getAllSlideIndices(page);
    const totalSlides = slideIndices.length;
    console.log(`✓ 检测到 ${totalSlides} 页幻灯片\n`);

    // 检测每一页
    const results = [];
    const overflowSlides = [];

    for (let i = 0; i < totalSlides; i++) {
      const indices = slideIndices[i];
      await navigateToSlide(page, indices);

      const slideData = await detectOverflow(page);
      // 尝试获取线性编号（包括纵向堆叠中的页）
      const enriched = await page.evaluate(() => {
        if (!window.Reveal) return null;
        const s = window.Reveal.getCurrentSlide();
        const linear = window.Reveal.getSlidePastCount ? (window.Reveal.getSlidePastCount(s) + 1) : null;
        const { h, v } = window.Reveal.getIndices();
        return { linear, indices: { h, v } };
      });
      slideData.index = (enriched && enriched.linear) ? enriched.linear : (i + 1);
      slideData.indices = enriched ? enriched.indices : { h: indices.h, v: indices.v };

      results.push(slideData);

      // 实时输出
      const status = slideData.hasOverflow ? '❌ OVERFLOW' : '✅ OK';
      const overflow = slideData.hasOverflow
        ? `(垂直: ${slideData.overflowAmount.vertical}px, 水平: ${slideData.overflowAmount.horizontal}px)`
        : '';

      console.log(`第 ${slideData.index} 页: ${status} - "${slideData.title}" ${overflow}`);

      if (slideData.hasOverflow) {
        overflowSlides.push(slideData);
      }
    }

    // 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      summary: {
        total: totalSlides,
        ok: totalSlides - overflowSlides.length,
        overflow: overflowSlides.length
      },
      results,
      overflowSlides
    };

    // 保存到文件
    const reportPath = path.join(__dirname, CONFIG.outputFile);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 报告已保存: ${reportPath}`);

    // 输出总结
    console.log('\n' + '='.repeat(60));
    console.log('检测完成！');
    console.log('='.repeat(60));
    console.log(`总页数: ${totalSlides}`);
    console.log(`正常: ${totalSlides - overflowSlides.length} 页`);
    console.log(`溢出: ${overflowSlides.length} 页`);

    if (overflowSlides.length > 0) {
      console.log('\n⚠️  以下页面有 overflow 问题:');
      overflowSlides.forEach(slide => {
        console.log(`  • 第 ${slide.index} 页: "${slide.title}"`);
        console.log(`    垂直溢出: ${slide.overflowAmount.vertical}px`);
        console.log(`    水平溢出: ${slide.overflowAmount.horizontal}px`);
      });
    } else {
      console.log('\n✨ 所有页面都没有 overflow 问题！');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { detectOverflow, main };
