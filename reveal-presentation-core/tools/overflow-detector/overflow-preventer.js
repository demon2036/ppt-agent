/**
 * OverflowPreventer - 物理意义上阻断一切 overflow
 *
 * 不依赖浏览器测量，而是主动防止任何元素产生 overflow
 * 使用三重监控机制 + 强制边界约束
 */

class OverflowPreventer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      mode: options.mode || 'strict', // 'strict' | 'auto-fix' | 'warn'
      enableLogs: options.enableLogs !== false,
      autoResize: options.autoResize !== false,
      maxIterations: options.maxIterations || 10,
      threshold: options.threshold || 0, // 0px 容差
      checkInterval: options.checkInterval || 100, // ms
      excludeSelectors: options.excludeSelectors || ['.notes', 'aside'],
      ...options
    };

    // 监控状态
    this.violations = new Map(); // 记录所有违规元素
    this.observers = [];
    this.isActive = false;
    this.checkTimer = null;

    // 统计数据
    this.stats = {
      totalChecks: 0,
      violations: 0,
      fixes: 0,
      prevented: 0
    };

    this._init();
  }

  /**
   * 初始化所有监控机制
   */
  _init() {
    this.log('🚀 初始化 OverflowPreventer (模式: ' + this.options.mode + ')');

    // 1. 强制应用 CSS 约束
    this._applyCSSConstraints();

    // 2. 初始扫描所有元素
    this._scanAllElements();

    // 3. 设置 MutationObserver（监控 DOM 变化）
    this._setupMutationObserver();

    // 4. 设置 ResizeObserver（监控尺寸变化）
    this._setupResizeObserver();

    // 5. 设置 IntersectionObserver（监控边界交叉）
    this._setupIntersectionObserver();

    // 6. 定期强制检查
    this._startPeriodicCheck();

    this.isActive = true;
    this.log('✅ OverflowPreventer 已启动');
  }

  /**
   * 强制应用 CSS 约束到容器
   */
  _applyCSSConstraints() {
    const containerStyles = {
      'overflow': 'hidden',
      'overflow-x': 'hidden',
      'overflow-y': 'hidden',
      'contain': 'layout style paint',
      'position': 'relative',
      'box-sizing': 'border-box'
    };

    for (const [prop, value] of Object.entries(containerStyles)) {
      this.container.style[prop] = value;
    }

    // 为容器添加标记
    this.container.setAttribute('data-overflow-prevented', 'true');
  }

  /**
   * 扫描所有元素并应用约束
   */
  _scanAllElements() {
    const elements = this._getAllElements();
    this.log(`🔍 扫描 ${elements.length} 个元素`);

    for (const element of elements) {
      this._constrainElement(element);
      this._checkElementBounds(element);
    }
  }

  /**
   * 获取所有需要监控的元素
   */
  _getAllElements() {
    const all = Array.from(this.container.querySelectorAll('*'));
    return all.filter(el => {
      // 排除指定选择器
      for (const selector of this.options.excludeSelectors) {
        if (el.matches(selector) || el.closest(selector)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * 对单个元素应用约束
   */
  _constrainElement(element) {
    const computed = window.getComputedStyle(element);
    const position = computed.position;

    // 为所有元素添加基础约束
    const constraints = {
      'box-sizing': 'border-box',
      'max-width': '100%'
    };

    // 如果是绝对定位或固定定位，需要特殊处理
    if (position === 'absolute' || position === 'fixed') {
      // 确保不会超出容器
      const parent = element.parentElement;
      if (parent) {
        constraints['max-width'] = '100%';
        constraints['max-height'] = '100%';
      }
    }

    // 应用约束
    for (const [prop, value] of Object.entries(constraints)) {
      if (!element.style[prop]) {
        element.style[prop] = value;
      }
    }

    // 添加标记
    element.setAttribute('data-overflow-constrained', 'true');
  }

  /**
   * 检查元素是否超出边界（物理检查）
   */
  _checkElementBounds(element) {
    this.stats.totalChecks++;

    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const overflow = {
      top: containerRect.top - elementRect.top,
      left: containerRect.left - elementRect.left,
      right: elementRect.right - containerRect.right,
      bottom: elementRect.bottom - containerRect.bottom
    };

    const threshold = this.options.threshold;
    const hasOverflow =
      overflow.top > threshold ||
      overflow.left > threshold ||
      overflow.right > threshold ||
      overflow.bottom > threshold;

    if (hasOverflow) {
      this._handleOverflow(element, overflow);
    } else {
      // 移除违规记录
      if (this.violations.has(element)) {
        this.violations.delete(element);
      }
    }

    return !hasOverflow;
  }

  /**
   * 处理 overflow 违规
   */
  _handleOverflow(element, overflow) {
    this.stats.violations++;

    const violation = {
      element,
      overflow,
      timestamp: Date.now(),
      fixed: false
    };

    this.violations.set(element, violation);

    this.log(`⚠️  检测到 overflow: ${this._getElementIdentifier(element)}`, {
      top: overflow.top,
      left: overflow.left,
      right: overflow.right,
      bottom: overflow.bottom
    });

    // 根据模式处理
    switch (this.options.mode) {
      case 'strict':
        this._strictFix(element, overflow);
        break;
      case 'auto-fix':
        this._autoFix(element, overflow);
        break;
      case 'warn':
        // 只警告，不修复
        break;
    }
  }

  /**
   * 严格模式：强制阻断 overflow
   */
  _strictFix(element, overflow) {
    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // 1. 强制设置最大尺寸
    const maxWidth = containerRect.width - (overflow.left > 0 ? overflow.left : 0);
    const maxHeight = containerRect.height - (overflow.top > 0 ? overflow.top : 0);

    element.style.maxWidth = `${Math.max(0, maxWidth)}px`;
    element.style.maxHeight = `${Math.max(0, maxHeight)}px`;

    // 2. 强制裁剪
    element.style.overflow = 'hidden';
    element.style.textOverflow = 'ellipsis';

    // 3. 如果超出右边界或底部，调整位置
    if (overflow.right > 0) {
      const currentLeft = parseFloat(window.getComputedStyle(element).left) || 0;
      element.style.left = `${currentLeft - overflow.right}px`;
    }

    if (overflow.bottom > 0) {
      const currentTop = parseFloat(window.getComputedStyle(element).top) || 0;
      element.style.top = `${currentTop - overflow.bottom}px`;
    }

    this.stats.prevented++;
    this.log(`🔒 已强制阻断: ${this._getElementIdentifier(element)}`);
  }

  /**
   * 自动修复模式：智能调整元素
   */
  _autoFix(element, overflow) {
    const computed = window.getComputedStyle(element);
    let fixed = false;

    // 1. 尝试调整字体大小
    if (overflow.bottom > 0 || overflow.right > 0) {
      const currentFontSize = parseFloat(computed.fontSize);
      if (currentFontSize > 10) {
        const newFontSize = currentFontSize * 0.95;
        element.style.fontSize = `${newFontSize}px`;
        fixed = true;
      }
    }

    // 2. 尝试调整 padding/margin
    if (!fixed && (overflow.bottom > 0 || overflow.right > 0)) {
      const padding = parseFloat(computed.padding) || 0;
      if (padding > 0) {
        element.style.padding = `${padding * 0.8}px`;
        fixed = true;
      }
    }

    // 3. 如果还是修复不了，使用严格模式
    if (!fixed) {
      this._strictFix(element, overflow);
      fixed = true;
    }

    if (fixed) {
      this.stats.fixes++;
      this.log(`🔧 已自动修复: ${this._getElementIdentifier(element)}`);

      // 标记为已修复
      const violation = this.violations.get(element);
      if (violation) {
        violation.fixed = true;
      }
    }
  }

  /**
   * 设置 MutationObserver
   */
  _setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // 处理新增节点
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this._constrainElement(node);
              this._checkElementBounds(node);

              // 递归处理子元素
              const children = node.querySelectorAll('*');
              for (const child of children) {
                this._constrainElement(child);
                this._checkElementBounds(child);
              }
            }
          }
        }

        // 处理属性变化
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          this._checkElementBounds(mutation.target);
        }
      }
    });

    observer.observe(this.container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    this.observers.push(observer);
    this.log('📡 MutationObserver 已启动');
  }

  /**
   * 设置 ResizeObserver
   */
  _setupResizeObserver() {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this._checkElementBounds(entry.target);
      }
    });

    // 监控容器本身
    observer.observe(this.container);

    // 监控所有现有元素
    const elements = this._getAllElements();
    for (const element of elements) {
      observer.observe(element);
    }

    this.observers.push(observer);
    this.log('📏 ResizeObserver 已启动');
  }

  /**
   * 设置 IntersectionObserver
   */
  _setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // 如果元素完全在容器内，ratio 应该是 1
        if (entry.intersectionRatio < 1) {
          // 元素部分超出了容器
          this._checkElementBounds(entry.target);
        }
      }
    }, {
      root: this.container,
      threshold: [0, 0.1, 0.5, 0.9, 1.0]
    });

    // 监控所有现有元素
    const elements = this._getAllElements();
    for (const element of elements) {
      observer.observe(element);
    }

    this.observers.push(observer);
    this.log('🎯 IntersectionObserver 已启动');
  }

  /**
   * 启动定期检查
   */
  _startPeriodicCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = setInterval(() => {
      const elements = this._getAllElements();
      for (const element of elements) {
        this._checkElementBounds(element);
      }
    }, this.options.checkInterval);

    this.log(`⏰ 定期检查已启动 (间隔: ${this.options.checkInterval}ms)`);
  }

  /**
   * 获取元素标识符
   */
  _getElementIdentifier(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    return `<${tag}${id}${classes}>`;
  }

  /**
   * 日志输出
   */
  log(message, data = null) {
    if (this.options.enableLogs) {
      if (data) {
        console.log(`[OverflowPreventer] ${message}`, data);
      } else {
        console.log(`[OverflowPreventer] ${message}`);
      }
    }
  }

  /**
   * 获取当前违规列表
   */
  getViolations() {
    return Array.from(this.violations.values());
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      currentViolations: this.violations.size,
      isActive: this.isActive
    };
  }

  /**
   * 强制重新检查所有元素
   */
  forceCheck() {
    this.log('🔄 强制重新检查所有元素');
    this._scanAllElements();
  }

  /**
   * 停止监控
   */
  stop() {
    this.log('⏹️  停止 OverflowPreventer');

    // 停止所有 observers
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];

    // 停止定期检查
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    this.isActive = false;
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stop();
    this.violations.clear();
    this.log('💥 OverflowPreventer 已销毁');
  }
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.OverflowPreventer = OverflowPreventer;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OverflowPreventer;
}
