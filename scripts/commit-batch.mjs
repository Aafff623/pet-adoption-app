#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const taskDirArg = process.argv[2];

if (!taskDirArg) {
  console.error('Usage: npm run task:commit-batch -- <task-dir>');
  console.error('Example: npm run task:commit-batch -- tasks/2026-02-21-phase2-adoption-match');
  process.exit(1);
}

const taskDir = path.resolve(repoRoot, taskDirArg);

if (!fs.existsSync(taskDir)) {
  console.error(`❌ 任务目录不存在: ${taskDirArg}`);
  process.exit(1);
}

function getGitDiff() {
  try {
    const output = execSync('git diff --name-only HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    return output
      .split('\n')
      .filter((f) => f.trim())
      .map((f) => f.trim());
  } catch (error) {
    return [];
  }
}

function categorizeFiles(files) {
  const categories = {
    types: [],
    api: [],
    components: [],
    pages: [],
    db: [],
    styles: [],
    tests: [],
    other: [],
  };

  files.forEach((file) => {
    if (file.includes('types.ts') || file.includes('types/')) {
      categories.types.push(file);
    } else if (file.includes('lib/api/')) {
      categories.api.push(file);
    } else if (file.includes('components/')) {
      categories.components.push(file);
    } else if (file.includes('pages/')) {
      categories.pages.push(file);
    } else if (file.includes('supabase/') || file.includes('.sql')) {
      categories.db.push(file);
    } else if (file.includes('.css') || file.includes('.scss') || file.includes('tailwind')) {
      categories.styles.push(file);
    } else if (file.includes('.test.') || file.includes('__tests__')) {
      categories.tests.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

function main() {
  console.log('\n📦 分批提交任务代码');
  console.log('─'.repeat(60));

  // 1. 检查是否有未提交的文件
  let stagedFiles = [];
  try {
    const output = execSync('git diff --name-only --cached', {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    stagedFiles = output
      .split('\n')
      .filter((f) => f.trim());
  } catch (error) {
    // 忽略错误
  }

  if (stagedFiles.length === 0) {
    console.log('⚠️  未发现暂存文件（git add），无法提交');
    console.log('\n💡 请先执行：');
    console.log('  git add .');
    process.exit(0);
  }

  console.log(`\n📝 发现 ${stagedFiles.length} 个改动文件`);

  // 2. 分类文件
  const categories = categorizeFiles(stagedFiles);

  // 3. 按优先级提交（types → api → components → pages）
  const commitOrder = [
    { key: 'types', title: '类型定义', scope: 'types' },
    { key: 'db', title: '数据库迁移', scope: 'db' },
    { key: 'api', title: 'API 实现', scope: 'api' },
    { key: 'components', title: 'UI 组件', scope: 'components' },
    { key: 'pages', title: '页面集成', scope: 'pages' },
    { key: 'styles', title: '样式调整', scope: 'style' },
    { key: 'tests', title: '测试', scope: 'test' },
    { key: 'other', title: '其他', scope: 'chore' },
  ];

  let totalCommitted = 0;

  for (const commit of commitOrder) {
    const files = categories[commit.key];
    if (files.length === 0) continue;

    console.log(`\n${commit.title}:`);
    files.forEach((f) => console.log(`  - ${f}`));

    // 暂存这些文件
    try {
      execSync(`git add ${files.map((f) => `"${f}"`).join(' ')}`, {
        cwd: repoRoot,
        stdio: 'pipe',
      });
    } catch (error) {
      console.error(`  ❌ 无法添加文件: ${error.message}`);
      continue;
    }

    // 生成提交信息
    const description =
      files.length === 1
        ? `${commit.title}`
        : `${commit.title} (${files.length} files)`;

    const commitMsg = `feat(${commit.scope}): ${description}`;

    // 执行提交
    try {
      execSync(`git commit -m "${commitMsg}"`, {
        cwd: repoRoot,
        stdio: 'pipe',
      });
      console.log(`  ✅ 已提交: ${commitMsg}`);
      totalCommitted++;
    } catch (error) {
      // 如果没有改动则跳过
      console.log(`  ⚠️  无改动，跳过`);
    }
  }

  // 4. 总结
  console.log('\n' + '─'.repeat(60));
  if (totalCommitted > 0) {
    console.log(`\n✅ 成功提交 ${totalCommitted} 个 commit`);
    console.log('\n📖 下一步：');
    console.log('  git log --oneline -n 5    # 查看提交历史');
    console.log('  git push                  # 推送到远程仓库');
  } else {
    console.log('\n⚠️  无 commit 产生');
  }
}

main();
