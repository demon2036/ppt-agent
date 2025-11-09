# Reveal Presentation Framework

> 利用 Claude Code Agent 自动化制作高质量学术演示文稿的完整工作流

## 项目简介

本项目是一个基于 **Reveal.js** 的模块化演示文稿框架，专为学术汇报和技术演讲设计。通过 **Claude Code Agent** 的辅助，实现了从内容创作到 PDF/PPT 导出的完全自动化工作流。

### 核心特性

- 🤖 **AI 驱动**：利用 Claude Code Agent 自动生成幻灯片内容和样式
- 🎨 **模块化设计**：样式、逻辑、内容完全分离（Core-First 架构）
- 📄 **完美导出**：一键生成高质量 PDF 和 PPT（1920×1080，16:9）
- 🎯 **零配置**：项目只需包含内容，所有样式和工具由核心框架提供
- 📐 **响应式**：使用相对单位（em/vh），任何分辨率完美适配
- 🚀 **快速迭代**：修改内容后即时预览，自动检测溢出

## 项目结构

```
.
├── reveal-presentation-core/       # 🔥 核心框架（公共部分）
│   ├── css/
│   │   └── presentation-base.css   # 通用样式（所有项目共享）
│   ├── js/
│   │   └── presentation-loader.js  # 模块化加载器
│   ├── tools/                      # 通用工具集
│   │   ├── pdf_to_ppt.py           # PDF→PPT 转换
│   │   ├── overflow-detector/      # 内容溢出检测
│   │   └── requirements_ppt.txt    # Python 依赖
│   └── templates/
│       └── index.html              # HTML 模板
│
├── PRESENTATION_SOP.md             # 📖 完整的标准操作流程（1178 行）
├── CLAUDE.md                       # → PRESENTATION_SOP.md（软链接）
├── AGENTS.md                       # → PRESENTATION_SOP.md（软链接）
├── GEMINI.md                       # → PRESENTATION_SOP.md（软链接）
│
└── .gitignore                      # 忽略项目特定内容
```

**注**：具体的演示项目（如 `WebLeaper_Presentation/`）不包含在版本控制中，因为它们是项目特定的内容。

## 安装

### 方法 1: 使用 Snap（推荐）

```bash
# 从源码构建 snap 包
git clone https://github.com/demon2036/ppt-agent.git
cd ppt-agent
snapcraft

# 安装构建好的 snap 包
sudo snap install --dangerous ppt-agent_1.0_amd64.snap

# 或者，从 Snap Store 安装（待发布）
# sudo snap install ppt-agent
```

安装后可用的命令：
- `ppt-agent.serve` - 启动 HTTP 服务器预览演示
- `ppt-agent.export-pdf` - 导出演示为 PDF
- `ppt-agent.pdf-to-ppt` - 将 PDF 转换为 PPT

### 方法 2: 直接克隆仓库

```bash
git clone https://github.com/demon2036/ppt-agent.git
cd ppt-agent
```

**依赖安装**：
```bash
# Ubuntu/Debian
sudo apt install python3 chromium-browser poppler-utils

# macOS
brew install python3 chromium poppler

# Python 依赖（用于 PPT 转换）
pip install -r reveal-presentation-core/tools/requirements_ppt.txt
```

## 快速开始

### 1. 创建新演示（使用 Snap）

```bash
# 进入工作目录
cd ~/presentations

# 复制模板（从 snap 安装路径）
cp -r /snap/ppt-agent/current/reveal-presentation-core/templates MyPresentation
cd MyPresentation

# 创建必要的目录
mkdir -p slides presentation_images

# 创建幻灯片清单
cat > slides/manifest.json << 'EOF'
[
  {"file": "01_title.html"},
  {"file": "02_content.html"}
]
EOF

# 创建第一张幻灯片
cat > slides/01_title.html << 'EOF'
<section class="title-slide">
  <h1>我的演示</h1>
  <p class="subtitle">精简有力的副标题</p>
  <p class="authors">作者名</p>
  <p class="affiliation">机构名</p>
</section>
EOF

# 启动预览服务器
ppt-agent.serve
# 打开 http://localhost:8000/index.html

# 导出为 PDF
ppt-agent.export-pdf

# 转换为 PPT
ppt-agent.pdf-to-ppt out/index.pdf out/presentation.pptx
```

### 2. 创建新演示（从源码）

```bash
# 从核心模板创建新项目
cp -r reveal-presentation-core/templates MyPresentation
cd MyPresentation

# 创建必要的目录
mkdir -p slides presentation_images

# 创建幻灯片清单
cat > slides/manifest.json << 'EOF'
[
  {"file": "01_title.html"},
  {"file": "02_content.html"}
]
EOF

# 创建第一张幻灯片
cat > slides/01_title.html << 'EOF'
<section class="title-slide">
  <h1>我的演示</h1>
  <p class="subtitle">精简有力的副标题</p>
  <p class="authors">作者名</p>
  <p class="affiliation">机构名</p>
</section>
EOF
```

### 3. 本地预览

```bash
# 启动本地服务器
python3 -m http.server 8000

# 在浏览器中打开
open http://localhost:8000/index.html
```

### 4. 导出为 PDF

```bash
# 复制导出脚本（如果模板中没有）
cp ../WebLeaper_Presentation/export_pdf.sh .

# 导出
./export_pdf.sh

# 输出：out/index.pdf
```

### 5. 转换为 PPT（可选）

```bash
# 安装 Python 依赖（仅首次）
pip install -r ../reveal-presentation-core/tools/requirements_ppt.txt

# 转换
python3 ../reveal-presentation-core/tools/pdf_to_ppt.py out/index.pdf out/presentation.pptx
```

## 构建和测试 Snap 包

### 前置要求

```bash
# Ubuntu/Debian
sudo apt install snapd snapcraft

# 确保 snapd 正在运行
sudo systemctl enable --now snapd
```

### 构建 Snap

```bash
# 在项目根目录
cd ppt-agent

# 清理之前的构建（如果有）
snapcraft clean

# 构建 snap 包
snapcraft

# 构建完成后会生成：ppt-agent_1.0_amd64.snap
```

### 安装本地构建的 Snap

```bash
# 安装（--dangerous 表示安装未签名的本地包）
sudo snap install --dangerous ppt-agent_1.0_amd64.snap

# 验证安装
snap list | grep ppt-agent

# 测试命令
ppt-agent.serve --help
```

### 测试 Snap 功能

```bash
# 1. 创建测试演示
mkdir -p ~/test-presentation/slides
cd ~/test-presentation

# 复制模板
cp -r /snap/ppt-agent/current/reveal-presentation-core/templates/* .

# 创建简单的幻灯片
cat > slides/manifest.json << 'EOF'
[{"file": "01_test.html"}]
EOF

cat > slides/01_test.html << 'EOF'
<section class="title-slide">
  <h1>测试演示</h1>
  <p class="subtitle">Snap 安装测试</p>
</section>
EOF

# 2. 启动服务器
ppt-agent.serve &
SERVER_PID=$!

# 等待服务器启动
sleep 2

# 3. 导出 PDF（需要在另一个终端或等待）
# 先停止服务器
kill $SERVER_PID

# 导出测试
ppt-agent.export-pdf index.html out/test.pdf

# 4. 转换为 PPT（如果 PDF 导出成功）
ppt-agent.pdf-to-ppt out/test.pdf out/test.pptx

# 5. 验证输出
ls -lh out/
```

### 卸载 Snap

```bash
sudo snap remove ppt-agent
```

### 故障排除

**问题：构建失败，提示缺少依赖**
```bash
# 安装额外的构建依赖
sudo apt install gcc python3-dev build-essential
```

**问题：PDF 导出失败**
```bash
# 检查 Chromium 是否正确安装在 snap 中
snap connections ppt-agent | grep browser-support

# 如果缺少权限，手动连接
sudo snap connect ppt-agent:browser-support
```

**问题：无法访问家目录**
```bash
# 确保 home 接口已连接
sudo snap connect ppt-agent:home
```

## 使用 Claude Code Agent 制作演示

### 典型工作流

1. **描述需求**：告诉 Claude 你要做什么演示（主题、内容结构）
2. **自动生成**：Claude 根据 SOP 自动创建幻灯片文件
3. **实时预览**：在浏览器中查看效果
4. **迭代优化**：让 Claude 调整样式、拆分内容、优化布局
5. **检测溢出**：运行溢出检测工具，确保内容不超出
6. **一键导出**：生成高质量 PDF 和 PPT

### 示例对话

```
User: 我需要做一个机器学习论文的演示，包含：标题页、背景介绍、方法、实验结果、结论。

Claude: 我会为你创建一个包含5个部分的演示。首先创建幻灯片结构...
[自动创建 manifest.json 和所有 HTML 文件]

User: 第三页内容太多了，能拆分吗？

Claude: 我会把"方法"拆分为两页：核心思想 + 技术细节...
[自动拆分并重新编号]

User: 导出成PDF

Claude: 正在导出...
[运行 export_pdf.sh，检查质量]
完成！PDF 已保存到 out/index.pdf（30 页，5.3MB）
```

## 核心设计哲学

### Core-First 架构

**原则**：所有通用的样式、逻辑、工具都在核心框架中，项目只包含内容。

```
┌─────────────────────────────────────┐
│  演示项目 (Content-Only)             │
│  ├── slides/       (内容)           │
│  ├── images/       (图片)           │
│  └── index.html    (引用核心)       │
└──────────┬──────────────────────────┘
           │ import
┌──────────▼──────────────────────────┐
│  reveal-presentation-core (Core)   │
│  ├── css/          (样式)           │
│  ├── js/           (逻辑)           │
│  └── tools/        (工具)           │
└─────────────────────────────────────┘
```

**优势**：
- ✅ 项目零 CSS、零 JS，只专注内容
- ✅ 核心改进，所有项目自动受益
- ✅ 新项目 5 分钟创建完成

### AI 辅助的最佳实践

1. **内容溢出检测**：Claude 自动估算页面高度，建议拆分
2. **样式一致性**：使用核心提供的样式类（`.insight-box`、`.two-columns` 等）
3. **响应式设计**：相对单位确保任何分辨率完美显示
4. **质量检查**：导出后自动验证页数、尺寸、文件大小

## 技术栈

- **Reveal.js 4.6.0** - HTML 演示框架
- **MathJax 3** - 数学公式渲染
- **Chrome Headless** - PDF 生成
- **Python (pdf2image + python-pptx)** - PPT 转换
- **Claude Code Agent** - AI 辅助开发

## 文档

完整的标准操作流程（SOP）请参考：

- 📖 **[PRESENTATION_SOP.md](PRESENTATION_SOP.md)** - 1178 行完整指南
  - 架构设计
  - 快速开始
  - 样式系统
  - 防止溢出
  - PDF/PPT 导出
  - 质量检查
  - 故障排除

## 工具集

核心框架提供以下工具：

| 工具 | 位置 | 功能 |
|------|------|------|
| **PDF 导出** | `export_pdf.sh` | Chrome Headless 生成高质量 PDF |
| **PPT 转换** | `tools/pdf_to_ppt.py` | PDF → PPT（200 DPI） |
| **溢出检测** | `tools/overflow-detector/` | 检测内容是否超出页面 |
| **模块加载器** | `js/presentation-loader.js` | 异步加载幻灯片 |

## 示例项目

查看 `WebLeaper_Presentation/` 了解完整的实战案例：
- 30 张幻灯片（学术论文汇报）
- 使用所有核心样式类
- 完美的 PDF/PPT 导出（无溢出）
- 模块化架构（每页独立文件）

## 贡献

欢迎提交 Issue 和 Pull Request！

如果你有改进建议：
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 致谢

- **Reveal.js** - 优秀的 HTML 演示框架
- **Claude Code Agent** - 强大的 AI 编程助手
- **所有贡献者**

---

**Made with ❤️ using Claude Code Agent**
