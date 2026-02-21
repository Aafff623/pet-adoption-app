#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const tasksDir = path.join(repoRoot, 'tasks');

function getTaskProgress(taskPath) {
  const specPath = path.join(taskPath, 'spec.md');
  const donePath = path.join(taskPath, 'done.md');
  const parentSpecPath = path.join(taskPath, 'parent-spec.md');

  if (!fs.existsSync(specPath) && !fs.existsSync(parentSpecPath)) {
    return 0;
  }

  let completionPercentage = 0;

  // 检查 parent-spec.md（主任务）
  if (fs.existsSync(parentSpecPath)) {
    completionPercentage = 10; // parent spec 存在 = 10%
  }

  // 检查 subtasks 完成情况
  const subtasksDir = path.join(taskPath, 'subtasks');
  if (fs.existsSync(subtasksDir)) {
    const subtasks = fs.readdirSync(subtasksDir).filter((d) =>
      fs.statSync(path.join(subtasksDir, d)).isDirectory()
    );

    if (subtasks.length > 0) {
      let completedSubtasks = 0;
      subtasks.forEach((subtask) => {
        const subtaskDonePath = path.join(subtasksDir, subtask, 'done.md');
        if (fs.existsSync(subtaskDonePath)) {
          const content = fs.readFileSync(subtaskDonePath, 'utf8');
          // 检查 "What changed" 是否被填充（超过占位符）
          if (content.includes('已完成内容概述：') && content.length > 200) {
            completedSubtasks++;
          }
        }
      });

      completionPercentage = 10 + Math.round((completedSubtasks / subtasks.length) * 80);
    }
  }

  // 检查 done.md（总体完成）
  if (fs.existsSync(donePath)) {
    const content = fs.readFileSync(donePath, 'utf8');
    if (content.includes('[x]') && content.length > 300) {
      completionPercentage = 100;
    }
  }

  return Math.min(completionPercentage, 100);
}

function getLastModified(taskPath) {
  const files = [];

  // 递归获取所有文件的 mtime
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      const stat = fs.statSync(fullPath);
      files.push(stat.mtime);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      }
    });
  }

  walkDir(taskPath);
  if (files.length === 0) return new Date();
  return new Date(Math.max(...files.map((d) => d.getTime())));
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d 前`;
  if (hours > 0) return `${hours}h 前`;
  return '最近';
}

function main() {
  if (!fs.existsSync(tasksDir)) {
    console.log('📋 暂无任务');
    return;
  }

  const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
  const tasks = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => {
      const taskPath = path.join(tasksDir, e.name);
      const progress = getTaskProgress(taskPath);
      const lastModified = getLastModified(taskPath);

      return {
        name: e.name,
        path: path.relative(repoRoot, taskPath),
        progress,
        lastModified,
      };
    })
    .sort((a, b) => b.lastModified - a.lastModified);

  if (tasks.length === 0) {
    console.log('📋 暂无任务，运行 npm run task:decompose 创建新任务');
    return;
  }

  console.log('\n📋 待做任务列表');
  console.log('─'.repeat(80));

  tasks.forEach((task, index) => {
    const progressBar = createProgressBar(task.progress);
    const statusEmoji = getStatusEmoji(task.progress);

    console.log(`\n${index + 1}. ${statusEmoji} ${task.name}`);
    console.log(`   📂 ${task.path}`);
    console.log(`   📊 进度: [${progressBar}] ${task.progress}%`);
    console.log(`   ⏰ 最后更新: ${formatDate(task.lastModified)}`);
  });

  console.log('\n' + '─'.repeat(80));
  console.log(`\n✨ 共 ${tasks.length} 个任务`);
  console.log('\n💡 提示：');
  console.log('  npm run task:decompose          创建新任务');
  console.log('  npm run task:mark-done          标记完成');
  console.log('  npm run task:commit-batch       分批提交');
}

function createProgressBar(percentage) {
  const bars = 20;
  const filled = Math.round((percentage / 100) * bars);
  const empty = bars - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getStatusEmoji(percentage) {
  if (percentage === 0) return '📝'; // 未开始
  if (percentage < 50) return '🟡'; // 进行中
  if (percentage < 100) return '🟠'; // 接近完成
  return '✅'; // 完成
}

main();
