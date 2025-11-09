#!/bin/bash
# 批量添加 dense-slide 类

cd "$(dirname "$0")/../slides"

# 需要修复的文件列表
files=(
  "002.html" "003.html" "005.html" "008.html" "009.html" "010.html"
  "011.html" "012.html" "013.html" "014.html" "015.html" "017.html"
  "018.html" "019.html" "021.html" "022.html" "023.html" "025.html"
  "026.html" "027.html" "029.html" "030.html"
)

echo "🔧 开始批量修复..."
echo ""

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  文件不存在: $file"
    continue
  fi

  # 检查是否已经有 dense-slide
  if grep -q 'class="dense-slide"' "$file"; then
    echo "⏭️  跳过 (已有 dense-slide): $file"
    continue
  fi

  # 替换 <section> 为 <section class="dense-slide">
  sed -i 's/<section>/<section class="dense-slide">/' "$file"

  if [ $? -eq 0 ]; then
    echo "✅ 修复成功: $file"
  else
    echo "❌ 修复失败: $file"
  fi
done

echo ""
echo "🎉 批量修复完成！"
echo "请运行 node detect-overflow.js 重新检测"
