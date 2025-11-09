# PDF 生成指南

由于服务器环境限制，无法自动生成PDF。请按照以下步骤在本地生成：

## 方法1：使用浏览器手动导出（推荐）

### 步骤：

1. **启动HTTP服务器**
   ```bash
   cd /home/user/ppt-agent
   python3 -m http.server 8000
   ```

2. **在浏览器中打开**
   ```
   http://localhost:8000/example2/index.html?print-pdf
   ```

   注意：必须加 `?print-pdf` 参数！

3. **打开打印对话框**
   - Windows/Linux: `Ctrl + P`
   - macOS: `Cmd + P`

4. **打印设置**
   - 目标: **另存为PDF**
   - 页面: **全部**
   - 布局: **横向**
   - 边距: **无**
   - 背景图形: **启用** (重要！保留颜色和渐变)

5. **保存**
   ```
   保存位置: /home/user/ppt-agent/example2/out/index.pdf
   ```

---

## 方法2：使用Chrome命令行（如果有Chrome）

```bash
cd /home/user/ppt-agent/example2

# 启动服务器（如果未运行）
python3 -m http.server 8000 &

# 使用Chrome生成PDF
google-chrome --headless=new \
  --disable-gpu \
  --no-sandbox \
  --print-to-pdf="out/index.pdf" \
  --print-to-pdf-no-header \
  --virtual-time-budget=20000 \
  --run-all-compositor-stages-before-draw \
  "http://localhost:8000/example2/index.html?print-pdf"
```

---

## 方法3：使用 Decktape（专业工具）

### 安装
```bash
npm install -g decktape
```

### 生成PDF
```bash
cd /home/user/ppt-agent/example2

# 启动服务器
python3 -m http.server 8000 &

# 使用decktape
decktape reveal http://localhost:8000/example2/index.html out/index.pdf
```

---

## 验证PDF质量

生成后检查：
```bash
# 查看PDF信息
pdfinfo out/index.pdf

# 应该看到：
# Pages: 5 (对应5张幻灯片)
# Page size: 1554.96 x 875.04 pts (16:9比例)
```

---

## 常见问题

### Q: PDF中颜色丢失
**A**: 确保打印设置中启用"背景图形"

### Q: PDF分页错误
**A**: 确保URL包含 `?print-pdf` 参数

### Q: PDF模糊
**A**: 浏览器打印质量设置为"高质量"

---

## 对比两个版本的PDF

生成两个PDF后对比：
```bash
# 纯CSS版本
http://localhost:8000/example/WebLeaper_Presentation/index.html?print-pdf
# 保存为: example_pure_css.pdf

# Tailwind版本
http://localhost:8000/example2/index.html?print-pdf
# 保存为: example_tailwind.pdf

# 对比
ls -lh *.pdf
```

视觉效果应该完全一致！
