#!/usr/bin/env node
/**
 * 自动修复 overflow 问题
 * 根据检测报告自动给有 overflow 的页面添加 dense-slide 类
 */

const fs = require('fs');
const path = require('path');

// 读取检测报告
const reportPath = path.join(__dirname, 'overflow-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// overflow 阈值（像素）
const THRESHOLDS = {
  minor: 50,      // 轻微overflow: 添加 compact-list
  moderate: 200,  // 中等overflow: 添加 dense-slide
  severe: 500     // 严重overflow: dense-slide + 额外调整
};

console.log('🔧 自动修复工具\n');
console.log(`总页数: ${report.summary.total}`);
console.log(`溢出页数: ${report.summary.overflow}\n`);

const fixes = [];

report.overflowSlides.forEach(slide => {
  const overflow = slide.overflowAmount.vertical;
  const slideFile = String(slide.index).padStart(3, '0') + '.html';
  const slidePath = path.join(__dirname, '../slides', slideFile);

  let fix = null;

  if (overflow >= THRESHOLDS.severe) {
    fix = {
      file: slideFile,
      overflow,
      action: 'add-dense-slide',
      severity: 'severe'
    };
  } else if (overflow >= THRESHOLDS.moderate) {
    fix = {
      file: slideFile,
      overflow,
      action: 'add-dense-slide',
      severity: 'moderate'
    };
  } else if (overflow >= THRESHOLDS.minor) {
    fix = {
      file: slideFile,
      overflow,
      action: 'check-manually',
      severity: 'minor'
    };
  }

  if (fix) {
    fixes.push(fix);
  }
});

// 按溢出量排序
fixes.sort((a, b) => b.overflow - a.overflow);

console.log('建议修复方案:\n');

fixes.forEach((fix, index) => {
  const severity = fix.severity === 'severe' ? '🔴' :
                   fix.severity === 'moderate' ? '🟡' : '🟢';
  console.log(`${severity} ${fix.file}: ${fix.overflow}px - ${fix.action}`);
});

console.log('\n需要添加 dense-slide 的文件列表:');
const densSlideFiles = fixes
  .filter(f => f.action === 'add-dense-slide')
  .map(f => f.file);

densSlideFiles.forEach(file => console.log(`  • ${file}`));

// 导出修复建议
const fixSuggestions = {
  timestamp: new Date().toISOString(),
  fixes,
  denseSlideFiles: densSlideFiles
};

const suggestionsPath = path.join(__dirname, 'fix-suggestions.json');
fs.writeFileSync(suggestionsPath, JSON.stringify(fixSuggestions, null, 2));

console.log(`\n📄 修复建议已保存: ${suggestionsPath}`);
console.log('\n手动执行修复步骤:');
console.log('1. 打开上述文件');
console.log('2. 将 <section> 改为 <section class="dense-slide">');
console.log('3. 重新运行检测: node detect-overflow.js');
