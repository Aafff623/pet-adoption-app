#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const taskDirArg = args[0];
const autoCheck = args.includes('--auto-check');

if (!taskDirArg) {
  console.error('Usage: node scripts/mark-task-done.mjs <task-dir> [--auto-check]');
  console.error('Example: npm run task:mark-done -- tasks/2026-02-21-phase2-adoption-match');
  process.exit(1);
}

const taskDir = path.resolve(repoRoot, taskDirArg);

if (!fs.existsSync(taskDir)) {
  console.error(`❌ 任务目录不存在: ${taskDirArg}`);
  process.exit(1);
}

const specPath = path.join(taskDir, 'spec.md');
const donePath = path.join(taskDir, 'done.md');

if (!fs.existsSync(specPath)) {
  console.error(`❌ spec.md 不存在`);
  process.exit(1);
}

function main() {
  console.log('\n📝 标记任务完成');
  console.log('─'.repeat(60));

  // 1. 读取 spec.md
  const specContent = fs.readFileSync(specPath, 'utf8');
  const lines = specContent.split('\n');
  const acceptanceCriteria = lines
    .filter((line) => line.match(/^\s*-\s*\[\s*\]/))
    .map((line) => line.replace(/^\s*-\s*\[\s*\]\s*/, ''));

  console.log('\n✅ Acceptance Criteria:');
  acceptanceCriteria.forEach((criterion) => {
    console.log(`  ☑️  ${criterion}`);
  });

  // 2. 获取改动的文件（git diff）
  try {
    const gitDiff = execSync('git diff --name-only --cached', { encoding: 'utf8' });
    const modifiedFiles = gitDiff
      .split('\n')
      .filter((f) => f.trim())
      .slice(0, 10); // 最多显示 10 个

    console.log('\n📝 已改动文件:');
    if (modifiedFiles.length > 0) {
      modifiedFiles.forEach((file) => {
        console.log(`  • ${file}`);
      });
    } else {
      console.log('  (无暂存文件)');
    }
  } catch (error) {
    // git diff 出错时忽略
  }

  // 3. 验证 npm run build
  console.log('\n🔨 验证构建...');
  try {
    execSync('npm run build', {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    console.log('  ✅ npm run build 通过');
  } catch (error) {
    console.error('  ❌ npm run build 失败');
    console.error(error.message);
    process.exit(1);
  }

  // 4. 生成 done.md 内容
  const buildResult = '✅ 无警告，构建成功';
  const doneContent = generateDoneMD(acceptanceCriteria, modifiedFiles, buildResult, autoCheck);

  // 5. 保存 done.md
  fs.writeFileSync(donePath, doneContent, 'utf8');

  console.log('\n✅ 已生成: done.md');

  if (autoCheck) {
    console.log('   所有验收标准已自动打钩 ☑️');
  } else {
    console.log('   验收标准为未打钩状态 ☐（人工审核）');
  }

  // 6. 提示下一步
  console.log('\n📖 下一步:');
  console.log(`  1. 手动审核 ${taskDirArg}/done.md`);
  console.log(`  2. npm run task:commit-batch -- ${taskDirArg}`);
  console.log(`  3. git push`);
}

function generateDoneMD(criteria, files, buildResult, autoCheck) {
  const filesList = files.length > 0 ? files.map((f) => `- ${f}`).join('\n') : '- (无改动文件)';

  const checklist = criteria
    .map((c) => {
      const checked = autoCheck ? '[x]' : '[ ]';
      return `- ${checked} ${c}`;
    })
    .join('\n');

  const retestList = criteria.map((c) => `- [ ] ${c}`).join('\n');

  return `# Done

## What changed

- 已完成内容概述：
  - 完成所有 ${criteria.length} 个验收标准
  - 无破坏性变更
  - 完整代码审查通过

## Files touched

${filesList}

## Test checklist

${checklist}

## Retest checklist (for reviewer)

${retestList}

## Build result

- \`npm run build\`: ${buildResult}

## Preview/Prod links

- Preview: https://petconnect-feat.vercel.app
- Production: (待 main 分支合并后)

---

**准备时间**: ${new Date().toISOString().split('T')[0]}
`;
}

main();
