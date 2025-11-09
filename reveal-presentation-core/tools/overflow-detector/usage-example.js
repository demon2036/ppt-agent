/**
 * OverflowPreventer 使用示例
 *
 * 展示如何在不同场景下使用 OverflowPreventer
 */

// ============================================
// 示例 1: 基础使用 - 严格模式
// ============================================
function example1_basic_strict() {
  const container = document.querySelector('.my-container');

  const preventer = new OverflowPreventer(container, {
    mode: 'strict',      // 严格模式：强制阻断任何 overflow
    enableLogs: true,    // 启用日志
    checkInterval: 100   // 每 100ms 检查一次
  });

  // 获取统计信息
  console.log(preventer.getStats());

  // 获取违规列表
  console.log(preventer.getViolations());
}

// ============================================
// 示例 2: 自动修复模式
// ============================================
function example2_auto_fix() {
  const container = document.querySelector('.content');

  const preventer = new OverflowPreventer(container, {
    mode: 'auto-fix',     // 自动修复：智能调整元素大小
    autoResize: true,     // 允许自动调整大小
    maxIterations: 10,    // 最多尝试 10 次修复
    threshold: 0          // 0px 容差（完全不允许溢出）
  });

  // 监听违规
  setInterval(() => {
    const violations = preventer.getViolations();
    if (violations.length > 0) {
      console.warn('检测到 overflow:', violations);
    }
  }, 1000);
}

// ============================================
// 示例 3: 仅警告模式（用于调试）
// ============================================
function example3_warn_mode() {
  const container = document.querySelector('.slides');

  const preventer = new OverflowPreventer(container, {
    mode: 'warn',         // 仅警告：不修复，只报告
    enableLogs: true,
    checkInterval: 200
  });

  // 定期输出报告
  setInterval(() => {
    const stats = preventer.getStats();
    console.table(stats);
  }, 5000);
}

// ============================================
// 示例 4: Reveal.js 集成
// ============================================
function example4_revealjs() {
  // 等待 Reveal.js 初始化完成
  Reveal.addEventListener('ready', () => {
    // 获取 slides 容器
    const slidesContainer = document.querySelector('.reveal .slides');

    // 为整个 slides 容器创建 preventer
    const globalPreventer = new OverflowPreventer(slidesContainer, {
      mode: 'auto-fix',
      enableLogs: true,
      checkInterval: 100,
      excludeSelectors: ['aside.notes', '.fragment'] // 排除备注和分段动画
    });

    // 为每一页单独监控
    const preventers = new Map();

    Reveal.addEventListener('slidechanged', (event) => {
      const currentSlide = event.currentSlide;

      // 如果当前页还没有 preventer，创建一个
      if (!preventers.has(currentSlide)) {
        const preventer = new OverflowPreventer(currentSlide, {
          mode: 'strict',
          enableLogs: false,
          checkInterval: 50
        });
        preventers.set(currentSlide, preventer);
      }

      // 检查当前页是否有 overflow
      const preventer = preventers.get(currentSlide);
      const violations = preventer.getViolations();

      if (violations.length > 0) {
        console.warn(`第 ${Reveal.getIndices().h + 1} 页有 overflow:`, violations);

        // 可选：在页面上显示警告
        showOverflowWarning(currentSlide, violations);
      }
    });
  });
}

// ============================================
// 示例 5: 动态内容监控
// ============================================
function example5_dynamic_content() {
  const container = document.querySelector('.dynamic-content');

  const preventer = new OverflowPreventer(container, {
    mode: 'strict',
    enableLogs: true
  });

  // 模拟动态添加内容
  const addButton = document.querySelector('#add-content');
  addButton.addEventListener('click', () => {
    const newElement = document.createElement('div');
    newElement.style.width = '2000px'; // 故意超宽
    newElement.style.height = '100px';
    newElement.textContent = '新添加的超宽元素';
    container.appendChild(newElement);

    // OverflowPreventer 会自动检测并处理
    // 通过 MutationObserver 监听到 DOM 变化

    // 手动触发检查（可选）
    setTimeout(() => {
      preventer.forceCheck();
    }, 100);
  });
}

// ============================================
// 示例 6: 响应式容器
// ============================================
function example6_responsive() {
  const container = document.querySelector('.responsive-container');

  const preventer = new OverflowPreventer(container, {
    mode: 'auto-fix',
    enableLogs: true,
    checkInterval: 100
  });

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    // ResizeObserver 会自动处理，但可以手动触发强制检查
    preventer.forceCheck();

    const stats = preventer.getStats();
    console.log('窗口大小变化后的统计:', stats);
  });
}

// ============================================
// 示例 7: 排除特定元素
// ============================================
function example7_exclude_elements() {
  const container = document.querySelector('.container');

  const preventer = new OverflowPreventer(container, {
    mode: 'strict',
    excludeSelectors: [
      '.notes',              // 排除备注
      'aside',               // 排除 aside 元素
      '.allow-overflow',     // 排除允许溢出的元素
      '[data-no-check]'      // 排除带特定属性的元素
    ]
  });
}

// ============================================
// 示例 8: 自定义容差
// ============================================
function example8_custom_threshold() {
  const container = document.querySelector('.container');

  const preventer = new OverflowPreventer(container, {
    mode: 'strict',
    threshold: 5  // 允许 5px 的容差
  });

  // 这样，只有超出 5px 以上的才会被认为是 overflow
}

// ============================================
// 示例 9: 获取详细违规信息
// ============================================
function example9_detailed_violations() {
  const container = document.querySelector('.container');

  const preventer = new OverflowPreventer(container, {
    mode: 'warn',
    enableLogs: false
  });

  // 定期检查违规
  setInterval(() => {
    const violations = preventer.getViolations();

    violations.forEach(violation => {
      const { element, overflow, timestamp, fixed } = violation;

      console.log({
        element: element.tagName + (element.id ? '#' + element.id : ''),
        overflow: {
          top: overflow.top,
          right: overflow.right,
          bottom: overflow.bottom,
          left: overflow.left
        },
        time: new Date(timestamp).toLocaleTimeString(),
        fixed: fixed
      });
    });
  }, 2000);
}

// ============================================
// 示例 10: 完整的 Reveal.js 集成（生产环境）
// ============================================
function example10_production_revealjs() {
  // 等待 Reveal.js 就绪
  Reveal.addEventListener('ready', () => {
    console.log('🚀 启动 OverflowPreventer for Reveal.js');

    // 全局 preventer
    const slidesContainer = document.querySelector('.reveal .slides');
    const globalPreventer = new OverflowPreventer(slidesContainer, {
      mode: 'auto-fix',
      enableLogs: false,  // 生产环境关闭日志
      checkInterval: 200,
      threshold: 2,       // 2px 容差
      excludeSelectors: ['aside.notes', '.fragment', 'aside']
    });

    // 每页的 preventer
    const slidePreventers = new Map();

    // 当前页检查
    function checkCurrentSlide() {
      const currentSlide = Reveal.getCurrentSlide();
      if (!currentSlide) return;

      // 创建或获取当前页的 preventer
      if (!slidePreventers.has(currentSlide)) {
        const preventer = new OverflowPreventer(currentSlide, {
          mode: 'strict',
          enableLogs: false,
          checkInterval: 100,
          threshold: 0,
          excludeSelectors: ['aside.notes', '.fragment']
        });
        slidePreventers.set(currentSlide, preventer);
      }

      const preventer = slidePreventers.get(currentSlide);
      const violations = preventer.getViolations();

      if (violations.length > 0) {
        // 在控制台显示警告
        const indices = Reveal.getIndices();
        console.warn(
          `⚠️  幻灯片 [${indices.h}, ${indices.v}] 检测到 ${violations.length} 个 overflow`,
          violations
        );

        // 可选：在页面右上角显示提示
        showOverflowBadge(violations.length);
      } else {
        hideOverflowBadge();
      }
    }

    // 监听幻灯片切换
    Reveal.addEventListener('slidechanged', checkCurrentSlide);

    // 初始检查
    checkCurrentSlide();

    // 提供全局访问
    window.overflowPreventer = {
      global: globalPreventer,
      slides: slidePreventers,
      check: checkCurrentSlide,
      getStats: () => globalPreventer.getStats()
    };

    console.log('✅ OverflowPreventer 已启动');
    console.log('💡 使用 window.overflowPreventer 访问 API');
  });
}

// ============================================
// 辅助函数
// ============================================

function showOverflowWarning(slide, violations) {
  // 在幻灯片上显示警告（可选实现）
  const warning = document.createElement('div');
  warning.className = 'overflow-warning';
  warning.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #dc3545;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
  `;
  warning.textContent = `⚠️ ${violations.length} overflow 问题`;
  slide.appendChild(warning);

  // 3秒后自动移除
  setTimeout(() => warning.remove(), 3000);
}

function showOverflowBadge(count) {
  let badge = document.querySelector('.overflow-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'overflow-badge';
    badge.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      z-index: 99999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(badge);
  }
  badge.textContent = `⚠️ ${count} overflow`;
}

function hideOverflowBadge() {
  const badge = document.querySelector('.overflow-badge');
  if (badge) {
    badge.remove();
  }
}

// ============================================
// 导出示例
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    example1_basic_strict,
    example2_auto_fix,
    example3_warn_mode,
    example4_revealjs,
    example5_dynamic_content,
    example6_responsive,
    example7_exclude_elements,
    example8_custom_threshold,
    example9_detailed_violations,
    example10_production_revealjs
  };
}
