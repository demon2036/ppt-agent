#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将PPT转换为图片截图的脚本
"""

import subprocess
import os
import fitz  # PyMuPDF
from pathlib import Path

def convert_pptx_to_pdf(pptx_path, pdf_path):
    """使用LibreOffice将PPTX转换为PDF"""
    print(f"正在将 {pptx_path} 转换为PDF...")

    # 创建临时文件名（不含中文）
    temp_pptx = "temp_presentation.pptx"
    temp_pdf = "temp_presentation.pdf"

    # 复制文件
    subprocess.run(['cp', pptx_path, temp_pptx], check=True)

    # 转换为PDF
    result = subprocess.run(
        ['libreoffice', '--headless', '--convert-to', 'pdf', temp_pptx, '--outdir', '.'],
        capture_output=True,
        text=True,
        timeout=60
    )

    if result.returncode != 0:
        print(f"LibreOffice错误: {result.stderr}")
        raise Exception(f"转换失败: {result.stderr}")

    # 重命名PDF
    if os.path.exists(temp_pdf):
        subprocess.run(['mv', temp_pdf, pdf_path], check=True)
        # 删除临时PPTX
        os.remove(temp_pptx)
        print(f"✓ PDF已生成: {pdf_path}")
        return True
    else:
        raise Exception("PDF文件未生成")

def pdf_to_images(pdf_path, output_dir, dpi=150):
    """将PDF的每一页转换为PNG图片"""
    print(f"\n正在将PDF转换为图片 (DPI={dpi})...")

    # 确保输出目录存在
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # 打开PDF文件
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"PDF共有 {total_pages} 页")

    # 转换每一页
    for page_num in range(total_pages):
        page = doc[page_num]

        # 设置缩放比例以获得更高质量的图片
        zoom = dpi / 72  # 72 DPI是默认值
        mat = fitz.Matrix(zoom, zoom)

        # 渲染页面为图片
        pix = page.get_pixmap(matrix=mat)

        # 保存图片
        output_file = os.path.join(output_dir, f"slide_{page_num + 1:02d}.png")
        pix.save(output_file)
        print(f"  ✓ 已生成第 {page_num + 1}/{total_pages} 页: {output_file}")

    doc.close()
    print(f"\n✓ 所有截图已保存到: {output_dir}/")

def main():
    """主函数"""
    pptx_file = "WebLeaper组会展示.pptx"
    pdf_file = "WebLeaper_Presentation.pdf"
    output_dir = "screenshots"

    if not os.path.exists(pptx_file):
        print(f"错误: 找不到文件 {pptx_file}")
        return

    try:
        # 步骤1: 转换PPTX为PDF
        convert_pptx_to_pdf(pptx_file, pdf_file)

        # 步骤2: 转换PDF为图片
        pdf_to_images(pdf_file, output_dir, dpi=200)

        print("\n" + "="*60)
        print("✓ 转换完成!")
        print(f"✓ 截图保存在: {output_dir}/")
        print("="*60)

    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
