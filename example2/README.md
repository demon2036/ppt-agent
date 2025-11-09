# Tailwind CSS 演示文稿示例

> 使用 Tailwind CSS 实用优先方法构建的 Reveal.js 演示文稿

## 🎯 核心特点

### 与纯CSS版本的对比

| 特性 | 纯CSS版本 | Tailwind版本 |
|------|----------|-------------|
| **样式定义** | 语义化类名 (`.observation-box`) | 实用类组合 (`p-4 rounded-lg border-l-4...`) |
| **HTML长度** | 简洁 | 较长（但所见即所得） |
| **定制化** | 需要修改CSS文件 | 直接在HTML中调整 |
| **维护方式** | 集中式（改1处影响全局） | 分布式（每处独立） |
| **CSS继承** | 存在级联问题 | 实用类直接应用，无继承 |
| **学习曲线** | 需要记住类名 | 需要学习Tailwind语法 |

## 🚀 快速开始

### 预览

```bash
# 启动服务器（从项目根目录）
cd /home/user/ppt-agent
python3 -m http.server 8000

# 访问
open http://localhost:8000/example2/index.html
```

### 导出PDF

**要求**：需要安装 Google Chrome 或 Chromium

```bash
cd example2
./export_pdf.sh

# 输出：out/index.pdf
```

**注意**：如果当前环境没有 Chrome，可以：
1. 在浏览器中打开 http://localhost:8000/example2/index.html?print-pdf
2. 按 Ctrl+P (或 Cmd+P) 打开打印对话框
3. 选择"另存为PDF"
4. 保存到 `out/index.pdf`

## 📋 幻灯片说明

### 01_title.html - 标题页
- **Tailwind特点**：使用 `flex` 布局实现居中
- **类名**：`h-full flex flex-col justify-center items-center`
- **渐变背景**：`bg-gradient-to-br from-primary-dark to-primary-blue`

### 02_observation.html - 观察盒子
- **盒子样式**：完全用实用类实现
- **类名**：`p-4 my-4 rounded-lg border-l-[0.3em] border-warning-red bg-gradient-to-r from-red-50 to-red-100`
- **打印优化**：`print:break-inside-avoid print:p-2`

### 03_two_columns.html - 两栏布局
- **网格布局**：`grid grid-cols-2 gap-8`
- **响应式间距**：屏幕 `gap-8`，打印 `print:gap-4`
- **公式盒子**：`bg-gray-100 p-5 my-4 rounded-lg`

### 04_dense.html - 密集内容
- **三栏网格**：`grid grid-cols-3 gap-6`
- **紧凑间距**：`p-3 text-sm leading-tight`
- **打印优化**：`print:p-2 print:gap-3`

### 05_comparison.html - 对比布局
- **对比盒子**：红色 `bg-red-50 border-warning-red` vs 绿色 `bg-green-50 border-success-green`
- **图标**：使用文本 emoji `✗` 和 `✓`
- **高亮**：`bg-yellow-200 px-1 rounded font-semibold`

## 🎨 Tailwind 配置

### 自定义颜色

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary-dark': '#303A52',
        'primary-blue': '#4A90E2',
        'primary-accent': '#F9AA33',
        'warning-red': '#E74C3C',
        'success-green': '#2ECC71',
      }
    }
  }
}
```

### 打印优化

```css
@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .reveal .slides section {
    page-break-inside: avoid !important;
  }
}
```

## ✅ Tailwind 的优势

### 1. 完全可控
```html
<!-- 直接看到所有样式，无需查CSS文件 -->
<div class="p-4 bg-blue-50 border-l-4 border-blue-500">
  内容
</div>
```

### 2. 无继承问题
```html
<!-- 不受 .reveal h3 等全局规则影响 -->
<h3 class="text-3xl font-bold mb-4">
  标题
</h3>
```

### 3. 精确微调
```html
<!-- 支持任意值 -->
<div class="p-[0.625em] border-l-[0.3em]">
  精确控制
</div>
```

### 4. 打印支持
```html
<!-- 使用 print: 前缀 -->
<div class="p-6 print:p-2 print:break-inside-avoid">
  屏幕6单位padding，打印2单位
</div>
```

## ⚠️ Tailwind 的权衡

### 1. HTML 更长
```html
<!-- 纯CSS：10字符 -->
<div class="observation-box">内容</div>

<!-- Tailwind：150字符 -->
<div class="p-4 my-4 rounded-lg border-l-[0.3em] border-warning-red bg-gradient-to-r from-red-50 to-red-100 font-bold print:break-inside-avoid">
  内容
</div>
```

### 2. 样式重复
- 如果40张幻灯片都有相同样式的盒子，需要重复写40次类名组合
- 修改样式需要批量替换（Find & Replace）

### 3. 一致性维护
- 容易出现不同页面用不同类名实现相同效果
- 例如：某页用 `p-4`，另一页用 `p-3`

## 💡 最佳实践建议

### 方案A：纯Tailwind
适合：每页都高度定制，很少有重复样式

```html
<div class="p-4 my-4 rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
  每页样式都不同
</div>
```

### 方案B：Tailwind + @layer components
适合：有一些重复样式，但仍需灵活调整

```css
@layer components {
  .observation-box {
    @apply p-4 my-4 rounded-lg border-l-[0.3em] border-warning-red bg-gradient-to-r from-red-50 to-red-100 font-bold print:break-inside-avoid;
  }
}
```

```html
<div class="observation-box">
  使用语义化类名，内部是Tailwind
</div>
```

### 方案C：混合使用
适合：大部分统一，少数需要微调

```html
<!-- 基础样式用类名 -->
<div class="observation-box p-3">  <!-- 覆盖默认的 p-4 -->
  局部调整
</div>
```

## 📊 技术栈

- **Presentation**: Reveal.js 4.6.0
- **CSS Framework**: Tailwind CSS (Play CDN)
- **Math**: MathJax 3
- **Export**: Chrome Headless

## 🔗 参考资源

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Reveal.js 文档](https://revealjs.com/)
- [打印优化指南](https://revealjs.com/pdf-export/)

---

**对比评估**：请查看此示例与 `example/WebLeaper_Presentation`（纯CSS版本）的区别，评估哪种方式更适合你的需求。
