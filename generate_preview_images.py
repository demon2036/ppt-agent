#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成PPT预览图的脚本
使用Pillow直接绘制每一页的简化版本
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 幻灯片尺寸 (16:9比例)
WIDTH = 1920
HEIGHT = 1080
BG_COLOR = (255, 255, 255)
TITLE_COLOR = (73, 31, 151)  # 紫色
TEXT_COLOR = (48, 58, 82)    # 深蓝色
BULLET_COLOR = (100, 100, 100)

def create_slide(title, content_lines, slide_num, output_dir):
    """创建一张幻灯片预览图"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # 绘制标题
    title_y = 100
    draw.text((100, title_y), title, fill=TITLE_COLOR, font=None)

    # 绘制内容
    content_y = 300
    line_height = 60
    for i, line in enumerate(content_lines):
        y = content_y + i * line_height
        draw.text((150, y), line, fill=TEXT_COLOR, font=None)

    # 绘制页码
    page_text = f"{slide_num} / 12"
    draw.text((WIDTH - 200, HEIGHT - 80), page_text, fill=BULLET_COLOR, font=None)

    # 保存图片
    output_file = os.path.join(output_dir, f"slide_{slide_num:02d}.png")
    img.save(output_file, 'PNG')
    print(f"  ✓ 已生成第 {slide_num}/12 页: {output_file}")

def generate_all_slides(output_dir):
    """生成所有幻灯片"""
    os.makedirs(output_dir, exist_ok=True)

    slides = [
        ("WebLeaper", [
            "Empowering Efficiency and Efficacy in WebAgent",
            "via Enabling Info-Rich Seeking",
            "",
            "Tongyi Lab, Alibaba Group"
        ]),
        ("研究背景与动机", [
            "• LLM-based agents正在变革开放式问题解决方法",
            "• 信息搜索(Information Seeking)是自主推理和决策的核心能力",
            "• 现有问题：当前IS agents存在搜索效率低的问题",
            "• 根本原因：训练任务中目标实体稀疏"
        ]),
        ("核心问题", [
            "• 问题1：如何提高信息搜索代理的搜索效率？",
            "• 问题2：如何在有限的上下文中嵌入更多的目标实体？",
            "• 问题3：如何生成既准确又高效的解决方案轨迹？",
            "• 挑战：需要同时优化正确性和搜索性能"
        ]),
        ("解决方案：WebLeaper框架", [
            "• 将信息搜索形式化为树状推理问题",
            "• 使用Wikipedia表格构建高覆盖率的IS任务",
            "• 提出三种任务合成变体：Basic、Union、Reverse-Union",
            "• 仅保留准确且高效的训练轨迹",
            "• 系统性地提高IS效率和效果"
        ]),
        ("方法详解", [
            "任务构建                          轨迹优化",
            "• Basic: 基础实体搜索            • 过滤低效搜索路径",
            "• Union: 联合多实体搜索          • 保留准确答案",
            "• Reverse-Union: 逆向搜索        • 优化搜索步骤数",
            "• 利用Wikipedia数据              • 平衡效率与效果"
        ]),
        ("实验结果", [
            "• 在5个IS基准上进行了广泛实验：",
            "  - BrowserComp (英文/中文)",
            "  - GAIA",
            "  - xbench-DeepSearch",
            "  - WideSearch, Seal-0",
            "• 相比强基线模型表现出持续的改进"
        ]),
        ("主要贡献", [
            "✓ 提出WebLeaper框架，系统性解决IS效率问题",
            "✓ 创新性地将IS建模为树状推理问题",
            "✓ 设计了三种任务合成变体，提高训练数据质量",
            "✓ 提出轨迹过滤策略，同时优化准确性和效率",
            "✓ 在多个benchmark上验证了方法的有效性"
        ]),
        ("技术亮点", [
            "创新点                          优势",
            "• 树状推理建模                  • 提高搜索效率",
            "• 高覆盖率任务构建              • 增强泛化能力",
            "• 多变体任务合成                • 保证答案准确性",
            "• 双重优化策略                  • 降低计算成本"
        ]),
        ("实验设置", [
            "• 数据来源：Wikipedia结构化表格",
            "• 评估基准：5个不同的IS benchmarks",
            "• 评估指标：准确率、搜索效率、成功率",
            "• 对比基线：多个SOTA的深度研究模型/系统",
            "• 实验环境：Basic设置和Comprehensive设置"
        ]),
        ("局限性与未来工作", [
            "当前局限                        未来方向",
            "• 依赖Wikipedia数据源           • 扩展到更多数据源",
            "• 任务类型相对受限              • 自动化任务生成",
            "• 需要人工设计变体              • 多模态信息搜索",
            "                                 • 实时搜索优化"
        ]),
        ("总结", [
            "• WebLeaper通过创新的框架设计解决了IS agents效率低的问题",
            "• 树状推理建模使得在有限上下文中嵌入更多目标实体成为可能",
            "• 三种任务合成变体系统性地提升了训练数据的质量和多样性",
            "• 轨迹过滤策略确保了准确性和效率的双重优化",
            "• 实验结果证明了方法在多个benchmark上的有效性和泛化能力"
        ]),
        ("Thanks!", [
            "",
            "",
            "Q & A",
            ""
        ])
    ]

    print("\n正在生成PPT预览图...")
    print("="*60)

    for i, (title, content) in enumerate(slides, 1):
        create_slide(title, content, i, output_dir)

    print("="*60)
    print(f"✓ 所有 {len(slides)} 张幻灯片预览图已生成!")
    print(f"✓ 保存在: {output_dir}/")

def main():
    output_dir = "screenshots"
    generate_all_slides(output_dir)

if __name__ == "__main__":
    main()
