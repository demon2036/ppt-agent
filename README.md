# WebLeaper 组会展示 PPT

这个仓库包含了 **WebLeaper: Empowering Efficiency and Efficacy in WebAgent via Enabling Info-Rich Seeking** 的组会展示PPT。

## 📊 PPT内容

完整的PPT包含23张幻灯片，涵盖以下内容：

1. 标题页 - WebLeaper项目介绍
2. 研究背景 - LLM agents和信息搜索
3. 核心问题 - 低搜索效率
4. 有效动作分布图 📊
5. 解决方案：WebLeaper框架
6. 方法概览图 📊
7. Version-I: Basic数据合成
8. Version-II: Union数据合成
9. Version-III: Reverse-Union数据合成
10. 信息引导的轨迹构造
11. 混合奖励系统与强化学习
12. 实验设置
13. 主要实验结果图 📊
14. 详细实验结果对比
15. 消融实验 - 不同数据源的影响
16. 轨迹构造消融图 📊
17. 效率与效果的联合提升 📊
18. 强化学习结果
19. RL训练曲线 📊
20. 主要贡献与创新
21. 数据集统计
22. 总结
23. Q & A

**特色内容：**
- ✅ 包含论文中的所有核心图表
- ✅ 详细的实验数据和结果对比
- ✅ 完整的方法论讲解
- ✅ 消融实验和RL训练分析

## 🖼️ PPT预览

查看所有幻灯片截图，请访问：**[screenshots文件夹](screenshots/)**

## 📄 文件说明

- `WebLeaper专业组会展示.pptx` - 完整的PowerPoint演示文稿（23页，包含论文图表）
- `create_professional_ppt.py` - 专业版PPT自动生成脚本
- `convert_pdfs_to_pngs.py` - PDF图片转PNG脚本
- `render_ppt_slides.py` - PPT截图生成脚本
- `screenshots/` - 包含所有23张幻灯片的PNG截图
- `figures_png/` - 论文图表PNG版本
- `arXiv-2510.24697v1/` - 论文源文件

## 🚀 如何使用

### 查看PPT
直接打开 `WebLeaper专业组会展示.pptx` 文件

### 重新生成PPT
```bash
# 先转换PDF图片为PNG
python convert_pdfs_to_pngs.py

# 生成专业版PPT
python create_professional_ppt.py
```

### 重新生成截图
```bash
python render_ppt_slides.py
```

## 📚 论文信息

**作者**: Zhengwei Tao*, Haiyang Shen*, Baixuan Li*, Wenbiao Yin, Jialong Wu, Kuan Li, Zhongwang Zhang, Huifeng Yin, Rui Ye, Liwen Zhang, Xinyu Wang, Pengjun Xie, Jingren Zhou, Yong Jiang

**机构**: Tongyi Lab, Alibaba Group

**论文来源**: arXiv-2510.24697v1
