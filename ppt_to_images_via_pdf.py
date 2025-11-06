#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通过PDF中转，将PPT转换为高质量图片
"""

import subprocess
import os
import fitz  # PyMuPDF
import time

def pptx_to_pdf_libreoffice(pptx_path, output_dir="."):
    """使用LibreOffice将PPTX转换为PDF"""
    print(f"正在将 {pptx_path} 转换为PDF...")

    # 使用绝对路径
    abs_pptx = os.path.abspath(pptx_path)
    abs_output_dir = os.path.abspath(output_dir)

    # 使用soffice命令，设置用户目录避免冲突
    cmd = [
        'soffice',
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', abs_output_dir,
        abs_pptx
    ]

    try:
        # 尝试转换
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
            env={**os.environ, 'HOME': '/tmp'}
        )

        # 检查PDF是否生成
        pdf_name = os.path.splitext(os.path.basename(pptx_path))[0] + '.pdf'
        pdf_path = os.path.join(output_dir, pdf_name)

        if os.path.exists(pdf_path):
            print(f"✓ PDF已生成: {pdf_path}")
            return pdf_path
        else:
            print(f"✗ PDF未生成")
            print(f"stdout: {result.stdout}")
            print(f"stderr: {result.stderr}")
            return None

    except subprocess.TimeoutExpired:
        print("✗ 转换超时")
        return None
    except Exception as e:
        print(f"✗ 转换失败: {e}")
        return None

def pdf_to_images(pdf_path, output_dir, dpi=200):
    """将PDF的每一页转换为PNG图片"""
    print(f"\n正在将PDF转换为图片 (DPI={dpi})...")

    if not os.path.exists(pdf_path):
        print(f"✗ PDF文件不存在: {pdf_path}")
        return False

    os.makedirs(output_dir, exist_ok=True)

    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        print(f"PDF共有 {total_pages} 页")
        print("=" * 60)

        for page_num in range(total_pages):
            page = doc[page_num]

            # 设置缩放以获得高质量
            zoom = dpi / 72
            mat = fitz.Matrix(zoom, zoom)

            # 渲染页面为图片
            pix = page.get_pixmap(matrix=mat, alpha=False)

            # 保存图片
            output_file = os.path.join(output_dir, f"slide_{page_num + 1:02d}.png")
            pix.save(output_file)
            print(f"  ✓ 已生成第 {page_num + 1}/{total_pages} 页: {output_file}")

        doc.close()
        print("=" * 60)
        print(f"✓ 所有 {total_pages} 张截图已保存到: {output_dir}/")
        return True

    except Exception as e:
        print(f"✗ 转换失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    pptx_file = "WebLeaper专业组会展示.pptx"
    pdf_file = "WebLeaper专业组会展示.pdf"
    output_dir = "screenshots"

    if not os.path.exists(pptx_file):
        print(f"✗ 错误: 找不到文件 {pptx_file}")
        return

    print("开始将PPT转换为高质量截图...")
    print("=" * 60)

    # 步骤1: PPTX -> PDF
    pdf_path = pptx_to_pdf_libreoffice(pptx_file, ".")

    if not pdf_path or not os.path.exists(pdf_path):
        print("\n由于LibreOffice转换失败，尝试备用方案...")
        # 检查是否已经有PDF文件
        if os.path.exists(pdf_file):
            print(f"✓ 使用已存在的PDF文件: {pdf_file}")
            pdf_path = pdf_file
        else:
            print("✗ 无法找到或生成PDF文件")
            return

    # 等待一下确保文件写入完成
    time.sleep(1)

    # 步骤2: PDF -> 图片
    success = pdf_to_images(pdf_path, output_dir, dpi=200)

    if success:
        print("\n" + "=" * 60)
        print("✓ 转换完成!")
        print(f"✓ 截图保存在: {output_dir}/")
        print("=" * 60)
    else:
        print("\n✗ 转换过程中出现错误")

if __name__ == "__main__":
    main()
