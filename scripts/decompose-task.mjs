#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Simple readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n📋 AI 任务自动拆解工具');
  console.log('─'.repeat(50));

  // 1. 获取功能主题
  const featureName = await question('\n🎯 功能主题 (如: AI 宠物匹配): ');
  if (!featureName.trim()) {
    console.error('❌ 功能主题不能为空');
    process.exit(1);
  }

  // 2. 获取具体需求
  console.log('\n📝 请输入具体需求 (支持多行，输入空行结束):');
  const requirements = [];
  while (true) {
    const line = await question('> ');
    if (!line.trim()) break;
    requirements.push(line);
  }

  if (requirements.length === 0) {
    console.error('❌ 需求描述不能为空');
    process.exit(1);
  }

  const requirementsText = requirements.join('\n');

  console.log('\n⏳ LLM 正在分析需求...');

  // 3. 调用 LLM 分析需求（模拟 DeepSeek/Gemini）
  const subtasks = generateSubtasks(featureName, requirementsText);

  if (!subtasks || subtasks.length === 0) {
    console.error('❌ LLM 拆解失败');
    process.exit(1);
  }

  // 4. 创建文件夹结构
  const today = new Date();
  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePart = `${yyyy}-${mm}-${dd}`;

  const normalizedName = featureName
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const mainTaskDir = path.join(repoRoot, 'tasks', `${datePart}-${normalizedName}`);
  const subtasksDir = path.join(mainTaskDir, 'subtasks');

  if (fs.existsSync(mainTaskDir)) {
    console.error(`❌ 任务目录已存在: tasks/${datePart}-${normalizedName}`);
    process.exit(1);
  }

  // 创建主文件夹
  fs.mkdirSync(mainTaskDir, { recursive: true });
  fs.mkdirSync(subtasksDir, { recursive: true });

  // 5. 创建 parent-spec.md
  const parentSpec = `# ${featureName}\n\n## 功能需求\n\n${requirementsText}\n\n## 子任务\n\n${subtasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}\n`;
  fs.writeFileSync(path.join(mainTaskDir, 'parent-spec.md'), parentSpec, 'utf8');

  // 6. 创建各 subtask 的 spec.md
  subtasks.forEach((subtask, index) => {
    const phaseNum = String(index + 1).padStart(2, '0');
    const subtaskSlug = subtask.title
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const subtaskDir = path.join(subtasksDir, `${phaseNum}-${subtaskSlug}`);
    fs.mkdirSync(subtaskDir, { recursive: true });

    const specContent = `# ${subtask.title}\n\n## 目标\n\n${subtask.description}\n\n## 验收标准\n\n${subtask.criteria.map((c) => `- [ ] ${c}`).join('\n')}\n\n## 范围\n\nIn scope:\n- ${subtask.scope.in.join('\n- ')}\n\nOut of scope:\n- ${subtask.scope.out.join('\n- ')}\n\n## API/DB 变更\n\n${subtask.changes || '无此阶段'}\n\n## 父任务\n\n- 关联父任务：../parent-spec.md\n`;
    fs.writeFileSync(path.join(subtaskDir, 'spec.md'), specContent, 'utf8');

    const doneContent = `# Done\n\n## What changed\n\n- 已完成内容概述：\n\n## Files touched\n\n- \n\n## Test checklist\n\n- [ ] 本地功能验证\n- [ ] 关键路径回归\n- [ ] 异常场景验证\n\n## Build result\n\n- \`npm run build\`：\n\n## Preview/Prod links\n\n- Preview:\n- Production:\n`;
    fs.writeFileSync(path.join(subtaskDir, 'done.md'), doneContent, 'utf8');
  });

  // 7. 输出成功信息
  console.log(`\n✅ 已创建任务结构: tasks/${datePart}-${normalizedName}`);
  console.log(`\n📁 文件夹树：`);
  console.log(`tasks/${datePart}-${normalizedName}/`);
  console.log(`├── parent-spec.md`);
  console.log(`└── subtasks/`);
  subtasks.forEach((t, i) => {
    const phaseNum = String(i + 1).padStart(2, '0');
    const slug = t.title.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const isLast = i === subtasks.length - 1;
    console.log(`   ${isLast ? '└──' : '├──'} ${phaseNum}-${slug}/`);
    console.log(`   ${isLast ? '    ' : '│  '} ├── spec.md`);
    console.log(`   ${isLast ? '    ' : '│  '} └── done.md`);
  });

  console.log(`\n📖 下一步：`);
  console.log(`1. npm run task:list          # 查看所有待做任务`);
  console.log(`2. 开始开发第一个 subtask    # Agent 自动选择文件夹`);
  console.log(`3. npm run task:mark-done    # 标记完成`);
  console.log(`4. npm run task:commit-batch # 分批提交代码`);

  rl.close();
}

/**
 * LLM 分析需求并拆解为 subtasks（使用 DeepSeek 或本地推理）
 * 这里使用静态模板示例，实际应调用真实 LLM API
 */
function generateSubtasks(featureName, requirements) {
  // 根据功能名称提供不同的拆解策略
  const isAdoptionMatch = featureName.includes('匹配') || featureName.includes('推荐');
  const isHealthDiary = featureName.includes('健康') || featureName.includes('日记');
  const isRescueBoard = featureName.includes('救助') || featureName.includes('任务');

  if (isAdoptionMatch) {
    return [
      {
        title: '类型定义 & 数据模型',
        description: '定义 TypeScript 接口、AdditionMatch 类型、数据流转模型',
        criteria: [
          'types.ts 中新增 AdoptionMatch 接口',
          '类型无 any，通过 TypeScript 严格检查',
          'DB schema 设计稿（adoption_match_scores 表）',
        ],
        scope: {
          in: ['types.ts 更新', 'DB schema 设计', '注释完整'],
          out: ['API 实现', 'UI 组件'],
        },
        changes: 'Types: AdoptionMatch, MatchScore\nDB: adoption_match_scores table (pending migration)',
      },
      {
        title: 'API 层实现 - 匹配算法',
        description: '实现 calculateMatchScore() 调用 LLM 生成评分，缓存结果',
        criteria: [
          'lib/api/adoptionMatch.ts 创建完成',
          'calculateMatchScore() 返回 {score: number, reason: string}',
          '成功调用 lib/api/llm.ts',
          '错误处理完善',
        ],
        scope: {
          in: ['API 实现', 'LLM 集成', '缓存机制'],
          out: ['UI 展示'],
        },
        changes: 'API: lib/api/adoptionMatch.ts\nLLM: integrate with lib/api/llm.ts',
      },
      {
        title: 'UI 组件 - 匹配卡片展示',
        description: '创建 AdoptionMatchCard 组件展示分数、理由、CTA',
        criteria: [
          'components/AdoptionMatchCard.tsx 创建',
          '显示分数 1-100，颜色编码',
          '显示 AI 推荐理由',
          '加载态和错误态处理',
        ],
        scope: {
          in: ['组件开发', 'Tailwind 样式'],
          out: ['页面集成'],
        },
        changes: 'Components: AdoptionMatchCard.tsx',
      },
      {
        title: '页面集成 - 首页推荐区',
        description: '在 Home 页面集成推荐卡片，处理登录状态',
        criteria: [
          'pages/Home.tsx 中增加"为你推荐"卡片区',
          '已登录用户显示推荐',
          '未登录用户显示登录提示',
          '卡片点击可查看详情',
        ],
        scope: {
          in: ['页面集成', '登录状态处理'],
          out: [''],
        },
        changes: 'Pages: pages/Home.tsx',
      },
      {
        title: '测试 & 优化',
        description: '本地测试所有流程，性能优化，验收确认',
        criteria: [
          'npm run build 通过无警告',
          'E2E 功能测试完成',
          'Preview 链接正常运行',
          'Acceptance Criteria 全部✅',
        ],
        scope: {
          in: ['功能测试', '性能优化'],
          out: [''],
        },
        changes: '无代码变更（验收阶段）',
      },
    ];
  }

  if (isHealthDiary) {
    return [
      {
        title: '数据库设计 & 迁移',
        description: '创建 pet_health_records 表、RLS 策略、索引',
        criteria: [
          'supabase/migrations/add_health_diary.sql 创建',
          'RLS policy 配置正确',
          '索引优化创建',
        ],
        scope: {
          in: ['DB 设计', '迁移脚本', 'RLS 策略'],
          out: ['API 实现'],
        },
        changes: 'DB: add pet_health_records table, RLS policies',
      },
      {
        title: 'API 层 - 日记 CRUD',
        description: '实现健康记录的增删改查',
        criteria: [
          'lib/api/healthDiary.ts 创建',
          'createHealthRecord / updateHealthRecord / deleteHealthRecord',
          '错误处理完善',
        ],
        scope: {
          in: ['API 实现', 'CRUD 操作'],
          out: ['UI 组件'],
        },
        changes: 'API: lib/api/healthDiary.ts',
      },
      {
        title: 'UI 组件 - 日记列表',
        description: '展示宠物的健康日记',
        criteria: [
          'components/HealthDiaryList.tsx 创建',
          '显示日期、类型、备注',
          '支持分页或虚拟滚动',
        ],
        scope: {
          in: ['组件开发'],
          out: ['详情页面'],
        },
        changes: 'Components: HealthDiaryList.tsx',
      },
    ];
  }

  if (isRescueBoard) {
    return [
      {
        title: '救助任务数据结构',
        description: '设计 rescue_tasks 表，任务状态机，权限策略',
        criteria: [
          'DB Schema: rescue_tasks 表设计',
          '状态字段：pending / assigned / in_progress / completed',
          'RLS 策略防止跨租户访问',
        ],
        scope: {
          in: ['DB 设计', 'Schema 定义'],
          out: ['API / UI'],
        },
        changes: 'DB: rescue_tasks table with RLS',
      },
      {
        title: 'API & 业务逻辑',
        description: '救助任务的发布、分配、进度更新',
        criteria: [
          'lib/api/rescueTasks.ts 实现',
          'publishRescueTask / assignTask / updateProgress',
          '触发器：自动推送通知',
        ],
        scope: {
          in: ['API 实现', '通知触发'],
          out: ['UI 页面'],
        },
        changes: 'API: lib/api/rescueTasks.ts, DB triggers',
      },
      {
        title: '页面 - 救助任务看板',
        description: '任务列表、详情、分配、进度跟踪',
        criteria: [
          'pages/RescueBoard.tsx 创建',
          '看板视图：待发布 / 进行中 / 已完成',
          '实时状态更新',
        ],
        scope: {
          in: ['页面开发'],
          out: [''],
        },
        changes: 'Pages: RescueBoard.tsx',
      },
    ];
  }

  // Default: 通用功能拆解 (3-4 个任务)
  return [
    {
      title: '类型定义 & 数据模型',
      description: '定义 TypeScript 接口和数据结构',
      criteria: ['类型定义完整', 'DB schema 设计完成', '无 any 类型'],
      scope: {
        in: ['Types 定义', 'DB schema 设计'],
        out: ['API 实现'],
      },
      changes: 'Types: new interfaces\nDB: schema pending',
    },
    {
      title: 'API 层实现',
      description: '后端数据访问和业务逻辑',
      criteria: ['CRUD 操作完整', '错误处理完善', 'npm run build 通过'],
      scope: {
        in: ['API 实现', '数据验证'],
        out: ['UI 组件'],
      },
      changes: 'API: new endpoints',
    },
    {
      title: 'UI 组件开发',
      description: '前端交互和视觉呈现',
      criteria: ['组件逻辑完整', 'Tailwind 样式适配', '暗色模式支持'],
      scope: {
        in: ['组件开发', '样式'],
        out: [''],
      },
      changes: 'Components: new React components',
    },
    {
      title: '页面集成 & 测试',
      description: '将组件集成到页面，完整功能测试',
      criteria: ['E2E 功能验证', '性能无退化', '所有 AC 通过'],
      scope: {
        in: ['页面集成', '测试验收'],
        out: [''],
      },
      changes: 'Pages: integration',
    },
  ];
}

main().catch(console.error);
