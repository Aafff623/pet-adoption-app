# 🚀 AI 工程化体系 Boilerplate 模版

> **目的**：为新项目快速集成"功能需求 → AI 自动拆解 → 自动完成"的完整工程化系统  
> **阶段**：Planning（无需 Coding）  
> **效果**：新项目初始化后，直接 `npm run task:decompose` 即可开始

---

## 📋 Boilerplate 版本控制

| 版本 | 时间 | 状态 |
|------|------|------|
| v1.0 | 2026-02-21 | ✅ 基于 PetConnect 稳定提炼 |
| v2.0 (Plan) | Q2 2026 | 🔄 集成 GitHub Actions CI/CD |
| v3.0 (Plan) | Q3 2026 | 🔄 支持多语言 + 国际化 |

---

## 🗂️ Boilerplate 文件结构

新项目应包含以下核心文件/文件夹（相对最少集合）：

```
your-new-project/
├── .ai/                          ← 核心规则库（从 PetConnect 复制）
│   ├── manifest.json             # 规则聚合配置
│   ├── mcp/
│   │   └── servers.json          # MCP 服务定义
│   ├── skills/
│   │   └── index.json            # 技能索引
│   └── rules/
│       ├── 00-global.md          # 全局规则
│       ├── 10-frontend.md        # 前端规则
│       ├── 20-backend.md         # 后端规则
│       ├── 30-db-supabase.md     # DB 规则
│       └── 40-security.md        # 安全规则
├── .cursor/
│   ├── rules/
│   │   └── PROJECT_RULES.md      # 自动生成（不应提交）
│   └── instructions.md           # Cursor 初始化指令
├── .github/
│   ├── copilot-instructions.md   # GitHub Copilot 指令
│   └── workflows/                # CI/CD 流程（可选）
├── .vscode/
│   ├── extensions.json           # 推荐插件
│   ├── settings.json             # VS Code 设置
│   └── launch.json               # 调试配置
├── scripts/                       ← AI 工程化脚本（从 PetConnect 复制）
│   ├── bootstrap.ps1
│   ├── bootstrap.sh
│   ├── bootstrap.mjs             # 通用 bootstrap（推荐）
│   ├── sync-ai.ps1
│   ├── sync-ai.sh
│   ├── doctor.ps1
│   ├── doctor.sh
│   ├── run-workflow.mjs
│   ├── sync-skills.mjs
│   ├── create-task-from-phase.mjs
│   ├── decompose-task.mjs        # ⭐ 核心：LLM 拆解
│   ├── list-tasks.mjs            # ⭐ 核心：列表展示
│   ├── mark-task-done.mjs        # ⭐ 核心：标记完成
│   └── commit-batch.mjs          # ⭐ 核心：分批提交
├── tasks/                         ← 任务目录
│   ├── README.md                 # 任务使用说明
│   └── _template/
│       ├── spec.md
│       └── done.md
├── docs/
│   ├── AI-TASK-SYSTEM.md         # ⭐ 从 PetConnect 复制
│   ├── WORKFLOW.md               # ⭐ 从 PetConnect 复制
│   └── QUICK_REFERENCE.md        # ⭐ 从 PetConnect 复制
├── .gitignore                     # 包含: .cursor/rules/PROJECT_RULES.md, .env.local 等
├── package.json                   # ⭐ 包含 5 个新 npm scripts
├── README.md                      # ⭐ 包含"核心工作流"section
└── <your-project-files>/

# 标注：
# ⭐ = 必须，从 PetConnect 复制
```

---

## 📦 初始化清单（Step by Step）

### Phase 1: 文件准备（Copy from PetConnect）

```bash
# 1. 复制核心文件夹
cp -r petconnect-app/.ai           your-new-project/
cp -r petconnect-app/scripts       your-new-project/
cp -r petconnect-app/docs          your-new-project/
cp -r petconnect-app/tasks         your-new-project/
cp -r petconnect-app/.github       your-new-project/
cp -r petconnect-app/.vscode       your-new-project/

# 2. 复制配置文件（可选修改）
cp petconnect-app/.gitignore       your-new-project/
cp petconnect-app/package.json     your-new-project/  # ⚠️ 需要调整依赖

# 3. 复制 README（该项目自己的 README！不用全部复制）
# 只需参考"工程化体系"和"核心工作流"sections
```

### Phase 2: 配置调整（Customize）

#### 2.1 修改 package.json

```json
{
  "name": "your-project-name",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "sync:ai": "node scripts/run-workflow.mjs sync",
    "sync:skills": "node scripts/sync-skills.mjs",
    "bootstrap:ai": "node scripts/run-workflow.mjs bootstrap",
    "doctor:ai": "node scripts/run-workflow.mjs doctor",
    "task:decompose": "node scripts/decompose-task.mjs",
    "task:list": "node scripts/list-tasks.mjs",
    "task:new": "node scripts/create-task-from-phase.mjs",
    "task:mark-done": "node scripts/mark-task-done.mjs",
    "task:commit-batch": "node scripts/commit-batch.mjs"
  },
  "dependencies": {
    // 根据你的项目调整（React/Vue/Svelte + 其他库）
  }
}
```

#### 2.2 修改 .ai/rules/ 中的规则

根据项目特点修改 5 个 rule 文件：
- `00-global.md` — 项目通用约束（Commit 格式、文件结构可能一致）
- `10-frontend.md` — **改**：框架（React/Vue/Svelte）、样式库（Tailwind/Bootstrap/UnoCSS）
- `20-backend.md` — **改**：语言（Node/Python/Go）、框架（Express/FastAPI/Gin）
- `30-db-supabase.md` — **改**：数据库类型（PostgreSQL/MySQL/MongoDB）、ORM（Prisma/SQLAlchemy）
- `40-security.md` — **改**：认证方式、加密需求可能不同

#### 2.3 修改 .github/copilot-instructions.md

替换成你的项目特定指令：
```markdown
# GitHub Copilot 项目指令 — Your Project Name

## 项目概述
你的项目简介...

## 技术栈约定
[根据实际调整]

## 文件结构规范
[根据实际调整]

[参考 PetConnect 的 .github/copilot-instructions.md 格式]
```

#### 2.4 修改 .cursor/instructions.md

```markdown
# Cursor IDE 初始化指令

打开项目时自动执行：

1. npm run bootstrap:ai        # 加载规则
2. npm run task:list           # 显示当前任务
3. 阅读 docs/AI-TASK-SYSTEM.md

# 工作流提醒
当用户说"新功能" → npm run task:decompose
当完成代码 → npm run task:mark-done -- <path> --auto-check (if user approves)
当推送 → npm run task:commit-batch
```

#### 2.5 修改 docs/ 中的文档

- `AI-TASK-SYSTEM.md` — **可复用** 90%，只需改 project name
- `WORKFLOW.md` — **可复用** 95%，改引用
- `QUICK_REFERENCE.md` — **可复用** 98%，改命令示例

#### 2.6 修改 README.md（你的项目 README）

在"工程化"或"快速开始"section 中加入：

```markdown
### ⚡ AI 工作流（推荐）

本项目集成了智能任务拆解系统。新功能开发流程：

1. 初始化（首次）
   ```bash
   npm run bootstrap:ai
   ```

2. 输入功能名 + 需求
   ```bash
   npm run task:decompose
   ```
