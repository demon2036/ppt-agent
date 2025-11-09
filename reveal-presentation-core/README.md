# Reveal Presentation Core

**SOTA演示框架 - 精简、优雅、可复用**

一个基于 Reveal.js 的模块化学术演示框架，让你专注于内容而非样板代码。

## ✨ 特性

- 🎨 **主题化设计** - CSS 变量驱动，轻松自定义
- 📦 **模块化架构** - 样式与内容完全分离
- ⚡ **智能加载** - 自动加载 manifest 和幻灯片
- 🎯 **开箱即用** - 3 分钟创建新演示
- 📄 **PDF 优化** - 完美的打印和导出效果
- 🔧 **零配置** - 合理的默认值，按需覆盖
- 📐 **响应式设计** - 全相对单位，任何尺寸自动适配（v3.0 新增）

## 🚀 快速开始

### 1. 创建新演示

```bash
# 在项目根目录
cp -r reveal-presentation-core/templates MyPresentation
cd MyPresentation
```

### 2. 准备幻灯片

创建 `slides/manifest.json`:

```json
[
  {"file": "01_title.html"},
  {"file": "02_intro.html"},
  {"file": "03_content.html"}
]
```

### 3. 编写幻灯片

`slides/01_title.html`:

```html
<section class="title-slide">
  <h1>我的演示</h1>
  <p class="subtitle">精简有力的副标题</p>
  <p class="authors">作者名</p>
  <p class="affiliation">机构</p>
</section>
```

### 4. 预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/index.html
```

## 📐 目录结构

```
YourPresentation/
├── index.html              # 从模板复制
├── slides/
│   ├── manifest.json       # 幻灯片清单
│   ├── 01_title.html
│   └── 02_content.html
└── images/                 # 图片资源（可选）
```

## 🎨 预定义样式

### 内容盒子

```html
<div class="observation-box">核心观察</div>
<div class="insight-box">关键洞察</div>
<div class="solution-box">解决方案</div>
```

### 布局

```html
<div class="two-columns">
  <div>左列</div>
  <div>右列</div>
</div>
```

### 高密度幻灯片

```html
<section class="dense-slide">
  <!-- 自动缩小字号和间距 -->
</section>
```

## ⚙️ 配置

在 `index.html` 中覆盖默认配置：

```javascript
initPresentation({
  reveal: {
    width: 1920,
    height: 1080,
    margin: 0.08,
    transition: 'slide'
  }
});
```

## 🎨 自定义主题

创建 `css/custom.css`:

```css
:root {
  --primary-dark: #your-color;
  --primary-blue: #your-color;
  --primary-accent: #your-color;
}
```

在 `index.html` 中引入：

```html
<link rel="stylesheet" href="css/custom.css">
```

## 📦 导出 PDF

```bash
# 使用 Chrome Headless
google-chrome --headless --disable-gpu --print-to-pdf=output.pdf \
  "http://localhost:8000/index.html?print-pdf"
```

## 🏗️ 架构设计

```
reveal-presentation-core/
├── css/
│   └── presentation-base.css    # 核心样式（主题化）
├── js/
│   └── presentation-loader.js   # 智能加载器
└── templates/
    └── index.html               # HTML模板
```

### 设计原则

1. **关注分离** - 样式、逻辑、内容完全解耦
2. **约定优于配置** - 合理默认，最小化配置
3. **渐进增强** - 基础功能开箱即用，高级功能按需启用
4. **可维护性** - CSS 变量 + 语义化类名

## 📚 样式系统

### CSS 变量

```css
--primary-dark      # 深色主题色
--primary-blue      # 蓝色主题色
--primary-accent    # 强调色
--text-primary      # 主文本颜色
--success/warning/info  # 语义色
--spacing-xs/sm/md/lg/xl  # 间距系统
```

### 语义化类名

- `.title-slide` - 标题幻灯片
- `.section-divider` - 章节分隔
- `.dense-slide` - 高密度内容
- `.observation-box` - 观察/问题
- `.insight-box` - 洞察/分析
- `.solution-box` - 解决方案

## 🔄 版本

- **v3.0.0** - CSS 全面相对化，真正的响应式设计
  - 所有单位从绝对（px）改为相对（em/%/vh）
  - 支持任意 16:9 分辨率，永不 overflow
  - 未来可扩展至 4K、720p 等

- **v1.0.0** - 首个稳定版本

## 📄 许可证

MIT

---

**让每一个演示都值得铭记**
