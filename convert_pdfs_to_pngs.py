#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将论文中的PDF图片转换为PNG格式
"""

import fitz  # PyMuPDF
import os
from PIL import Image

def pdf_to_png(pdf_path, png_path, dpi=200):
    """将PDF转换为PNG"""
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]  # 获取第一页

        # 设置缩放以获得高质量
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)

        # 渲染为图片
        pix = page.get_pixmap(matrix=mat)

        # 保存为PNG
        pix.save(png_path)
        doc.close()
        print(f"  ✓ {os.path.basename(pdf_path)} -> {os.path.basename(png_path)}")
        return True
    except Exception as e:
        print(f"  ✗ {os.path.basename(pdf_path)} 转换失败: {e}")
        return False

def main():
    """主函数"""
    fig_dir = "arXiv-2510.24697v1/figures/"
    output_dir = "figures_png/"

    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)

    # 需要转换的PDF文件
    pdf_files = [
        "infogain_cover_rate_kde.pdf",
        "overview.pdf",
        "main_results.pdf",
        "traj_ablation_bar_plot.pdf",
        "tool_call_performance_scatter.pdf",
        "reward_curve_compact.pdf",
        "toolcall.pdf"
    ]

    print("开始转换PDF图片为PNG...")
    print("=" * 60)

    success_count = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(fig_dir, pdf_file)
        png_file = pdf_file.replace(".pdf", ".png")
        png_path = os.path.join(output_dir, png_file)

        if os.path.exists(pdf_path):
            if pdf_to_png(pdf_path, png_path):
                success_count += 1
        else:
            print(f"  ✗ {pdf_file} 不存在")

    # 复制PNG和JPG文件
    for img_file in os.listdir(fig_dir):
        if img_file.endswith(('.png', '.jpg', '.jpeg')):
            src = os.path.join(fig_dir, img_file)
            dst = os.path.join(output_dir, img_file)
            import shutil
            shutil.copy(src, dst)
            print(f"  ✓ 复制 {img_file}")

    print("=" * 60)
    print(f"✓ 转换完成！成功转换 {success_count}/{len(pdf_files)} 个PDF文件")

if __name__ == "__main__":
    main()
