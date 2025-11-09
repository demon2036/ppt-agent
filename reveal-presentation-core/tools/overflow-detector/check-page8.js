#!/usr/bin/env node
/**
 * 专门检查第8页的溢出情况，并截图
 */

const puppeteer = require('puppeteer');

async function checkPage8() {
  console.log('🔍 专项检查第 8 页...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 加载页面
    await page.goto('http://localhost:8000/WebLeaper_Presentation/index.html', {
      waitUntil: 'load',
      timeout: 60000
    });

    // 等待 Reveal 初始化
    await page.waitForFunction(() => window.Reveal && window.Reveal.isReady(), {
      timeout: 30000
    });

    // 导航到第 8 页
    await page.evaluate(() => {
      window.Reveal.slide(7, 0); // 第 8 页，索引从 0 开始
    });

    await page.waitForFunction(() => {
      const cur = window.Reveal.getIndices();
      return cur.h === 7;
    }, { timeout: 15000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 详细检测
    const result = await page.evaluate(() => {
      const slide = window.Reveal.getCurrentSlide();
      const slideRect = slide.getBoundingClientRect();

      // 获取所有可见元素
      const allElements = Array.from(slide.querySelectorAll('*'));
      const visibleElements = allElements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.visibility !== 'hidden' && style.display !== 'none';
      });

      // 计算内容边界
      let contentTop = Infinity, contentLeft = Infinity;
      let contentRight = -Infinity, contentBottom = -Infinity;

      visibleElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        contentTop = Math.min(contentTop, rect.top);
        contentLeft = Math.min(contentLeft, rect.left);
        contentRight = Math.max(contentRight, rect.right);
        contentBottom = Math.max(contentBottom, rect.bottom);
      });

      // 计算溢出
      const overflowTop = Math.max(0, slideRect.top - contentTop);
      const overflowLeft = Math.max(0, slideRect.left - contentLeft);
      const overflowRight = Math.max(0, contentRight - slideRect.right);
      const overflowBottom = Math.max(0, contentBottom - slideRect.bottom);

      // 获取图片信息
      const images = Array.from(slide.querySelectorAll('img'));
      const imageInfo = images.map(img => ({
        src: img.src,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        rect: img.getBoundingClientRect()
      }));

      return {
        title: slide.querySelector('h1, h2, h3')?.textContent || 'Unknown',
        slideRect: {
          top: slideRect.top,
          left: slideRect.left,
          right: slideRect.right,
          bottom: slideRect.bottom,
          width: slideRect.width,
          height: slideRect.height
        },
        contentBounds: {
          top: contentTop,
          left: contentLeft,
          right: contentRight,
          bottom: contentBottom,
          width: contentRight - contentLeft,
          height: contentBottom - contentTop
        },
        overflow: {
          top: overflowTop,
          left: overflowLeft,
          right: overflowRight,
          bottom: overflowBottom
        },
        scroll: {
          height: slide.scrollHeight,
          width: slide.scrollWidth
        },
        client: {
          height: slide.clientHeight,
          width: slide.clientWidth
        },
        images: imageInfo,
        elementCount: visibleElements.length,
        innerHTML: slide.innerHTML.substring(0, 500) // 前 500 字符
      };
    });

    console.log('📊 第 8 页详细信息:\n');
    console.log(JSON.stringify(result, null, 2));

    // 截图
    await page.screenshot({
      path: 'overflow-detector/page8-screenshot.png',
      fullPage: false
    });
    console.log('\n📸 截图已保存: overflow-detector/page8-screenshot.png');

    // 截取当前幻灯片
    const slideElement = await page.$('.reveal .slides section.present');
    if (slideElement) {
      await slideElement.screenshot({
        path: 'overflow-detector/page8-slide-only.png'
      });
      console.log('📸 幻灯片截图已保存: overflow-detector/page8-slide-only.png');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

checkPage8().catch(error => {
  console.error(error);
  process.exit(1);
});
