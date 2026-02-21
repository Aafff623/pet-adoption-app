#!/usr/bin/env node

/**
 * Bootstrap AI-Powered Development Template
 * 
 * 用途：为新项目 5 分钟快速初始化完整的 AI 工程化系统
 * 
 * 使用：node bootstrap-new-project.mjs <project-name> [--framework=react|vue|svelte|next|node]
 * 
 * 示例：
 *   node bootstrap-new-project.mjs my-app --framework=react
 *   node bootstrap-new-project.mjs my-api --framework=node
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const projectName = args[0];
const frameworkArg = args.find((arg) => arg.startsWith('--framework='));
const framework = frameworkArg ? frameworkArg.split('=')[1] : 'react';

if (!projectName) {
  console.error('❌ Usage: node bootstrap-new-project.mjs <project-name> [--framework=react|vue|svelte|next|node]');
  process.exit(1);
}

const validFrameworks = ['react', 'vue', 'svelte', 'next', 'node'];
if (!validFrameworks.includes(framework)) {
  console.error(`❌ Invalid framework: ${framework}. Valid options: ${validFrameworks.join(', ')}`);
  process.exit(1);
}

const baseDir = path.resolve(`./${projectName}`);

console.log('\n🚀 AI 工程化体系 Boilerplate 初始化');
console.log('─'.repeat(60));
console.log(`📦 项目名: ${projectName}`);
console.log(`🎨 框架: ${framework}`);
console.log(`📁 目标路径: ${baseDir}`);

// 创建项目目录
if (fs.existsSync(baseDir)) {
  console.error(`\n❌ 项目目录已存在: ${baseDir}`);
  process.exit(1);
}

fs.mkdirSync(baseDir, { recursive: true });
console.log(`\n✅ 创建项目目录`);

// 创建核心目录结构
const dirsToCreate = [
  '.ai/rules',
  '.ai/mcp',
  '.ai/skills',
  '.cursor/rules',
  '.github/workflows',
  '.vscode',
  'scripts',
  'docs',
  'tasks/_template',
  'src',
];

dirsToCreate.forEach((dir) => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});
console.log(`✅ 创建文件夹结构 (${dirsToCreate.length} 个)`);

// 生成 .ai/manifest.json
const manifest = {
  version: '1.0.0',
  rules: {
    global: './rules/00-global.md',
    frontend: './rules/10-frontend.md',
    backend: './rules/20-backend.md',
    database: './rules/30-db-supabase.md',
    security: './rules/40-security.md',
  },
  sync: {
    target: [
      '../.cursor/rules/PROJECT_RULES.md',
      '../../.github/copilot-instructions.md',
    ],
  },
};
fs.writeFileSync(path.join(baseDir, '.ai/manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`✅ 生成 .ai/manifest.json`);

// 生成规则文件占位符
const ruleTemplate = (title) =>
  `# ${title}\n\n⚠️ TODO：请根据你的项目特点填充此文件\n\n参考 PetConnect 的对应规则文件：\nhttps://github.com/yourname/petconnect-app/blob/main/.ai/rules/\n`;

const ruleFiles = {
  '00-global.md': '全局约束（代码提交规范、文件结构)',
  '10-frontend.md': '前端规范（框架、样式库、组件约定）[根据 ' + framework + ' 调整]',
  '20-backend.md': '后端规范（语言、框架、API 设计',
  '30-db-supabase.md': '数据库规范（RLS、迁移脚本、索引)',
  '40-security.md': '安全约束（无密钥、类型检查、加密)',
};

Object.entries(ruleFiles).forEach(([filename, title]) => {
  const filePath = path.join(baseDir, '.ai/rules', filename);
  fs.writeFileSync(filePath, ruleTemplate(title), 'utf8');
});
console.log(`✅ 生成 5 个规则文件模板`);

// 生成 package.json
const packageJson = {
  name: projectName,
  version: '0.0.0',
  type: 'module',
  private: true,
  scripts: {
    dev: '[TODO: dev command for ' + framework + ']',
    build: '[TODO: build command for ' + framework + ']',
    preview: '[TODO: preview command]',
    'sync:ai': 'node scripts/run-workflow.mjs sync',
    'sync:skills': 'node scripts/sync-skills.mjs',
    'bootstrap:ai': 'node scripts/run-workflow.mjs bootstrap',
    'doctor:ai': 'node scripts/run-workflow.mjs doctor',
    'task:decompose': 'node scripts/decompose-task.mjs',
    'task:list': 'node scripts/list-tasks.mjs',
    'task:new': 'node scripts/create-task-from-phase.mjs',
    'task:mark-done': 'node scripts/mark-task-done.mjs',
    'task:commit-batch': 'node scripts/commit-batch.mjs',
  },
  dependencies: {
    '[TODO: Framework dependencies]': '^latest',
  },
  devDependencies: {
    '[TODO: Dev dependencies]': '^latest',
  },
};
fs.writeFileSync(path.join(baseDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');
console.log(`✅ 生成 package.json`);

// 生成 .gitignore
const gitignore = `# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment
.env.local
.env.*.local

# IDE / Editor
.cursor/rules/PROJECT_RULES.md
.vscode/**
!.vscode/extensions.json
!.vscode/settings.json

# Build
dist/
build/
.next/
out/

# OS
.DS_Store
Thumbs.db

# Project-specific
tasks/**/done.md
!tasks/_template/

# Logs
*.log
npm-debug.log*
`;
fs.writeFileSync(path.join(baseDir, '.gitignore'), gitignore, 'utf8');
console.log(`✅ 生成 .gitignore`);

// 生成 README.md
const readmeContent = `# ${projectName}

> AI-Powered Development Project

## 🚀 快速开始

### 1. 初始化项目（首次）
\`\`\`bash
npm install
npm run bootstrap:ai
\`\`\`

### 2. 查看当前任务
\`\`\`bash
npm run task:list
\`\`\`

### 3. 拆解新功能需求
\`\`\`bash
npm run task:decompose
\`\`\`

### 4. 开发 & 完成 & 提交
\`\`\`bash
# 开发代码...

# 标记完成（默认不打钩）
npm run task:mark-done -- tasks/2026-XX-XX-/subtasks/01-types

# 审核后让 AI 打钩
npm run task:mark-done -- tasks/.../01-types --auto-check

# 分批提交
npm run task:commit-batch -- tasks/2026-XX-XX-feature

git push
\`\`\`

## 📖 文档

- [docs/AI-TASK-SYSTEM.md](docs/AI-TASK-SYSTEM.md) - 智能任务拆解系统
- [.ai/rules/](/.ai/rules/) - 编码规范（待填充）

## ⚠️ Todo

- [ ] 根据框架特点完善 .ai/rules/ 文件
- [ ] 填充 package.json 的依赖和脚本
- [ ] 编写项目特定的 .github/copilot-instructions.md
- [ ] 运行 npm run bootstrap:ai 同步规则到 IDE

---

**Framework**: ${framework}  
**Created**: ${new Date().toISOString().split('T')[0]}
`;
fs.writeFileSync(path.join(baseDir, 'README.md'), readmeContent, 'utf8');
console.log(`✅ 生成 README.md`);

// 生成 tasks/_template/spec.md 和 done.md
const specTemplate = `# Spec

## Goal

[描述这个任务的目标]

## Acceptance Criteria

- [ ] 验收标准 1
- [ ] 验收标准 2
- [ ] 验收标准 3

## Scope

- In scope:
  - 
- Out of scope:
  - 

## API/DB Touch

- API 变更：
- DB 变更：

## Linked Demand Doc

- [关联文档](../parent-spec.md)
`;

const doneTemplate = `# Done

## What changed

- 已完成内容概述：

## Files touched

- 

## Test checklist

- [ ] 本地功能验证
- [ ] 关键路径回归
- [ ] 异常场景验证

## Build result

- \`npm run build\`：

## Preview/Prod links

- Preview:
- Production:
`;

fs.writeFileSync(path.join(baseDir, 'tasks/_template/spec.md'), specTemplate, 'utf8');
fs.writeFileSync(path.join(baseDir, 'tasks/_template/done.md'), doneTemplate, 'utf8');
console.log(`✅ 生成 tasks/_template/`);

// 生成 .github/copilot-instructions.md 占位符
const copilotInstructions = `# GitHub Copilot 项目指令 — ${projectName}

## 项目概述

[TODO: 项目简介]

## 技术栈

[TODO: 列出技术栈]

- Framework: ${framework}
- Language: [TODO]
- Database: [TODO]

## 工程化体系

本项目集成了 AI 驱动的开发系统。参考：

- 文档：docs/AI-TASK-SYSTEM.md
- 规范：.ai/rules/

### 核心工作流

\`\`\`bash
npm run bootstrap:ai              # 初始化
npm run task:decompose            # 拆解需求
npm run task:list                 # 查看任务
npm run task:mark-done -- <path> # 标记完成
npm run task:commit-batch -- <path> # 分批提交
\`\`\`

---

[参考 PetConnect 的 .github/copilot-instructions.md 完善此文件]
`;
fs.writeFileSync(path.join(baseDir, '.github/copilot-instructions.md'), copilotInstructions, 'utf8');
console.log(`✅ 生成 .github/copilot-instructions.md`);

// 生成 .cursor/instructions.md
const cursorInstructions = `# Cursor IDE 初始化指令

当打开此项目时，执行以下步骤：

1. npm install
2. npm run bootstrap:ai
3. npm run task:list

## 工作流提示

- 用户说"新功能" → 执行 \`npm run task:decompose\`
- 完成代码后 → 执行 \`npm run task:mark-done -- <path> --auto-check\`
- 推送前 → 执行 \`npm run task:commit-batch -- <path>\`

---

详见 docs/AI-TASK-SYSTEM.md
`;
fs.writeFileSync(path.join(baseDir, '.vscode/settings.json'), JSON.stringify({}, null, 2), 'utf8');
fs.writeFileSync(
  path.join(baseDir, '.vscode/extensions.json'),
  JSON.stringify({
    recommendations: ['GitHub.copilot', 'ms-vscode.eslint'],
  }, null, 2),
  'utf8'
);
fs.writeFileSync(path.join(baseDir, '.cursor/instructions.md'), cursorInstructions, 'utf8');
console.log(`✅ 生成 IDE 配置文件`);

// 生成 docs/README.md
const docsReadme = `# 文档

## 核心文档

- [AI-TASK-SYSTEM.md](AI-TASK-SYSTEM.md) - AI 工程化系统使用指南
- [WORKFLOW.md](WORKFLOW.md) - 详细工作流（参考 PetConnect）
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考卡

## 如何填充

1. 从 PetConnect 项目复制 AI-TASK-SYSTEM.md / WORKFLOW.md / QUICK_REFERENCE.md
2. 根据本项目特点调整示例和框架名称

---

参考资源：https://github.com/yourname/petconnect-app/tree/main/docs
`;
fs.writeFileSync(path.join(baseDir, 'docs/README.md'), docsReadme, 'utf8');
console.log(`✅ 生成 docs/README.md`);

// 生成 tasks/README.md
const tasksReadme = `# 任务管理

本项目使用 AI 驱动的任务管理系统。

## 使用流程

### 1. 初始化
\`\`\`bash
npm run bootstrap:ai
\`\`\`
`;
fs.writeFileSync(path.join(baseDir, 'tasks/README.md'), tasksReadme, 'utf8');
console.log(`✅ 生成 tasks/README.md`);

// 输出初始化完成的检查清单
console.log('\n' + '─'.repeat(60));
console.log('✅ Boilerplate 初始化完成！');
console.log('─'.repeat(60));

console.log(`\n📁 项目位置: ${baseDir}`);
console.log(`\n📋 下一步检查清单：`);
console.log(`\n1. 进入项目目录`);
console.log(`   cd ${projectName}`);
console.log(`\n2. 根据框架 [${framework}] 完善 .ai/rules/ 文件`);
console.log(`   vim .ai/rules/10-frontend.md  # 编辑前端规范`);
console.log(`\n3. 填充 package.json 的实际依赖和脚本`);
console.log(`   vim package.json`);
console.log(`\n4. 从 PetConnect 复制文档到 docs/`);
console.log(`   cp ../petconnect-app/docs/AI-TASK-SYSTEM.md docs/`);
console.log(`   cp ../petconnect-app/docs/WORKFLOW.md docs/`);
console.log(`   cp ../petconnect-app/docs/QUICK_REFERENCE.md docs/`);
console.log(`\n5. 从 PetConnect 复制脚本到 scripts/`);
console.log(`   cp -r ../petconnect-app/scripts/*.mjs scripts/`);
console.log(`\n6. 初始化 npm 和 Git`);
console.log(`   npm install`);
console.log(`   git init`);
console.log(`   git add .`);
console.log(`   git commit -m "chore: initialize AI-powered development boilerplate"`);
console.log(`\n7. 启动项目`);
console.log(`   npm run bootstrap:ai`);
console.log(`   npm run task:list`);
console.log(`\n💡 快速参考:`);
console.log(`   npm run task:decompose  # 拆解新功能`);
console.log(`   npm run task:list       # 查看任务`);
console.log(`   npm run task:mark-done  # 标记完成`);
console.log(`   npm run task:commit-batch # 分批提交`);

console.log('\n🎉 准备好开始开发了！');
console.log('─'.repeat(60) + '\n');
