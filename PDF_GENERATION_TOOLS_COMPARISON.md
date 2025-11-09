# HTML转PDF工具对比

> 不依赖Chrome的替代方案评估

---

## 📊 工具对比总结

| 工具 | JavaScript支持 | 安装难度 | 速度 | 质量 | 适用场景 |
|------|--------------|---------|------|------|---------|
| **Chrome/Chromium** | ✅ 完整 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **推荐** - Reveal.js等动态内容 |
| **Playwright** | ✅ 完整 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 自动化测试 + PDF生成 |
| **wkhtmltopdf** | ✅ 有限 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 简单页面，本地资源 |
| **WeasyPrint** | ❌ 不支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 纯CSS静态页面 |
| **Pandoc** | ❌ 不支持 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Markdown转PDF |
| **浏览器手动** | ✅ 完整 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | **最简单** - 一次性导出 |

---

## 🔍 详细评估

### 1. Chrome/Chromium Headless ⭐⭐⭐⭐⭐
**最佳选择（如果可以安装）**

```bash
google-chrome --headless=new \
  --disable-gpu \
  --no-sandbox \
  --print-to-pdf="output.pdf" \
  --print-to-pdf-no-header \
  "http://localhost:8000/index.html?print-pdf"
```

**优势**：
- ✅ 完整JavaScript支持
- ✅ 完美渲染CSS（包括渐变、阴影、动画）
- ✅ Reveal.js官方推荐
- ✅ 打印模式完整支持

**劣势**：
- ❌ 需要安装完整浏览器（~150-200MB）
- ❌ 依赖系统库（本项目遇到的问题）

**适用场景**：Reveal.js演示文稿（你的项目）

---

### 2. Playwright ⭐⭐⭐⭐⭐
**编程化最佳选择**

```bash
# 安装
pip3 install playwright
playwright install chromium

# Python脚本
python3 generate_pdf_playwright.py url output.pdf
```

**优势**：
- ✅ 基于Chromium，效果与Chrome完全一致
- ✅ Python API，易于集成
- ✅ 支持所有现代Web特性
- ✅ 跨平台（Windows/Mac/Linux）

**劣势**：
- ❌ 仍需下载Chromium（174MB）
- ❌ 仍需系统库支持（本项目遇到崩溃）

**适用场景**：自动化CI/CD流水线

**本项目状态**：
- ✅ 已安装Playwright
- ✅ Chromium已下载（174MB）
- ❌ 浏览器崩溃（缺少系统库）

---

### 3. wkhtmltopdf ⭐⭐⭐⭐
**轻量级替代方案**

```bash
# 安装（本项目已安装✅）
apt-get install wkhtmltopdf

# 使用
wkhtmltopdf \
  --page-width 1920px \
  --page-height 1080px \
  --enable-javascript \
  --javascript-delay 5000 \
  "http://localhost:8000/index.html?print-pdf" \
  output.pdf
```

**优势**：
- ✅ 基于WebKit（比Chrome轻量）
- ✅ 支持JavaScript（有限）
- ✅ 安装简单（apt-get）
- ✅ 独立工具，不依赖浏览器

**劣势**：
- ❌ JavaScript支持有限（基于旧版WebKit）
- ❌ 无法加载CDN资源（本项目遇到网络错误）
- ❌ CSS渲染不如Chrome完整

**适用场景**：本地资源的简单页面

**本项目状态**：
- ✅ 已安装
- ❌ 无法加载CDN资源（网络限制）

**解决方案**：需要把所有CDN资源内联到HTML

---

### 4. WeasyPrint ⭐⭐
**纯Python方案（不推荐用于Reveal.js）**

```bash
# 安装（本项目已安装✅）
pip3 install weasyprint

# 使用
python3 generate_pdf_weasyprint.py url output.pdf
```

**优势**：
- ✅ 纯Python实现
- ✅ 无需浏览器
- ✅ 安装超简单
- ✅ 速度快

**劣势**：
- ❌ **不支持JavaScript**（致命缺陷）
- ❌ CSS支持有限
- ❌ 无法渲染Reveal.js（依赖JS）

**测试结果**：
- 生成的PDF只有860字节（空白）
- Reveal.js幻灯片完全无法渲染

**适用场景**：纯HTML+CSS静态页面（如报告、发票）

**不适用**：任何依赖JavaScript的页面

---

### 5. Pandoc ⭐⭐
**文档转换工具**

```bash
# 安装
apt-get install pandoc texlive

# 使用（需要先转为Markdown）
pandoc input.md -o output.pdf
```

**优势**：
- ✅ 文档转换瑞士军刀
- ✅ 支持多种格式

**劣势**：
- ❌ 不支持HTML→PDF（需要LaTeX）
- ❌ 不适合演示文稿
- ❌ 无JavaScript支持

**适用场景**：Markdown文档转PDF

---

### 6. 浏览器手动导出 ⭐⭐⭐⭐⭐
**最简单可靠的方法**

```
1. 打开浏览器访问 http://localhost:8000/example2/index.html?print-pdf
2. 按 Ctrl+P (或 Cmd+P)
3. 目标：另存为PDF
4. 启用"背景图形"
5. 保存
```

**优势**：
- ✅ 零安装
- ✅ 100%兼容
- ✅ 完美质量
- ✅ 所有人都会用

**劣势**：
- ❌ 手动操作，无法自动化
- ❌ 不适合批量处理

**适用场景**：一次性导出、验证效果

---

## 🎯 针对你的项目的推荐

### 场景1：在开发服务器上（当前环境）

**最佳方案**：**浏览器手动导出**

原因：
- Chrome/Playwright 崩溃（缺少系统库）
- wkhtmltopdf 无法加载CDN（网络限制）
- WeasyPrint 不支持JavaScript

**步骤**：
1. 访问 `http://localhost:8000/example2/index.html?print-pdf`
2. Ctrl+P
3. 另存为PDF

---

### 场景2：在本地开发机器上

**最佳方案**：**Chrome命令行 或 Playwright**

```bash
# 方法1：Chrome CLI
google-chrome --headless=new \
  --print-to-pdf="output.pdf" \
  "http://localhost:8000/example2/index.html?print-pdf"

# 方法2：Playwright
pip3 install playwright
playwright install chromium
python3 generate_pdf_playwright.py url output.pdf
```

---

### 场景3：在CI/CD流水线中

**最佳方案**：**Playwright（Docker镜像）**

```dockerfile
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN playwright install chromium

CMD ["python3", "generate_pdf_playwright.py"]
```

---

### 场景4：需要轻量级工具（无浏览器）

**最佳方案**：**wkhtmltopdf + 本地资源**

需要修改HTML：
1. 下载所有CDN资源到本地
2. 修改HTML引用本地文件
3. 使用wkhtmltopdf生成

```bash
# 下载Reveal.js到本地
wget https://cdn.jsdelivr.net/npm/reveal.js@4.6.0/dist/reveal.js
# ...下载所有依赖

# 修改index.html使用本地路径
<script src="./vendor/reveal.js"></script>

# 生成PDF
wkhtmltopdf index.html output.pdf
```

---

## ✅ 工具安装状态（本项目）

| 工具 | 状态 | 可用性 | 说明 |
|------|------|--------|------|
| **Chrome** | ❌ 未安装 | ❌ | - |
| **Playwright** | ✅ 已安装 | ❌ | 浏览器崩溃 |
| **wkhtmltopdf** | ✅ 已安装 | ❌ | 网络错误 |
| **WeasyPrint** | ✅ 已安装 | ❌ | 不支持JS |
| **浏览器手动** | ✅ 可用 | ✅ | **推荐** |

---

## 🚀 实际操作建议

### 立即可用的方法：

1. **预览**：访问 `http://localhost:8000/example2/index.html`
2. **打印预览**：访问 `http://localhost:8000/example2/index.html?print-pdf`
3. **生成PDF**：浏览器中 Ctrl+P → 另存为PDF

### 如果需要自动化：

在**本地机器**（不是服务器）上：

```bash
# 安装Playwright
pip3 install playwright
playwright install chromium

# 使用提供的脚本
python3 generate_pdf_playwright.py \
  "http://localhost:8000/example2/index.html" \
  example2/out/tailwind.pdf
```

---

## 📝 总结

**对于Reveal.js演示文稿**：

| 需求 | 推荐工具 |
|------|---------|
| **一次性导出** | 浏览器手动（Ctrl+P） |
| **本地自动化** | Playwright 或 Chrome CLI |
| **CI/CD** | Playwright Docker |
| **轻量级** | wkhtmltopdf（需要内联资源） |
| **纯静态** | WeasyPrint（不适合Reveal.js） |

**本项目最佳实践**：
1. 开发时：浏览器手动导出
2. 生产环境：Playwright + Docker

---

**创建时间**：2025-11-09
**测试环境**：Ubuntu服务器（网络受限）
