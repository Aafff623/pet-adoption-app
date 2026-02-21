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

3. 开发各 subtask（types → api → ui）
   - Cursor IDE 自动加载编码规范 (.ai/rules/)
   - 每步验证：npm run build

4. 验收完后标记完成
   ```bash
   npm run task:mark-done -- tasks/.../01-types --auto-check
   ```

5. 分批提交
   ```bash
   npm run task:commit-batch -- tasks/2026-02-21-feature
   git push
   ```

📖 详见 [docs/AI-TASK-SYSTEM.md](docs/AI-TASK-SYSTEM.md)
```

---

## 🚀 初始化脚本

为加速新项目初始化，创建一个 `bootstrap-new-project.sh` 脚本（可选）：

```bash
#!/bin/bash

# 复制 boilerplate 源
BOILERPLATE_SOURCE="path/to/petconnect-boilerplate"
PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./bootstrap-new-project.sh <project-name>"
  exit 1
fi

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# 复制文件
cp -r "$BOILERPLATE_SOURCE/.ai" .
cp -r "$BOILERPLATE_SOURCE/scripts" .
cp -r "$BOILERPLATE_SOURCE/docs" .
cp -r "$BOILERPLATE_SOURCE/tasks" .
cp "$BOILERPLATE_SOURCE/.gitignore" .
cp "$BOILERPLATE_SOURCE/package.json" .

echo "✅ Boilerplate 初始化完成！"
echo "📖 下一步："
echo "  1. 根据项目调整 .ai/rules/ 和 package.json"
echo "  2. npm install"
echo "  3. npm run bootstrap:ai"
echo "  4. npm run task:decompose"
```

---

## ✅ 验收清单（新项目就绪）

```bash
# 初始化完成后检查：

# 1. 所有文件是否到位
ls -la .ai/ scripts/ docs/ tasks/

# 2. npm 命令是否正确
npm run task:list      # 应该显示当前任务
npm run doctor:ai      # 应该通过健康检查

# 3. 是否能拆解需求
npm run task:decompose
# 输入: "示例功能" + "示例需求" + <Enter>
# 应该生成 tasks/YYYY-MM-DD-example-feature/subtasks/

# 4. 是否能标记完成
npm run task:mark-done -- tasks/YYYY-MM-DD-example-feature/subtasks/01-types
# 应该自动创建 done.md

# 5. Git 提交
npm run task:commit-batch -- tasks/YYYY-MM-DD-example-feature
# 应该生成多个 commit
```

---

## 📊 Boilerplate vs 手动配置对比

| 步骤 | 手动 | Boilerplate |
|------|-----|------------|
| 创建 .ai/rules/ | 10 min | 1 sec（copy） |
| 创建 scripts/ | 30 min | 1 sec（copy） |
| 写 docs/ | 2-3h | 10 min（调整） |
| npm 命令配置 | 15 min | 1 sec（copy） |
| 项目规范文档 | 1h+ | 20 min（参考） |
| **总耗时** | **4-5h** | **30 min** |

---

## 🎯 Boilerplate 的不同项目场景

### 场景 1：React 前端项目

```bash
复制 boilerplate → 修改 10-frontend.md（React 规范）
                → 修改 package.json（React 依赖）
                → npm run bootstrap:ai
                → npm run task:decompose
```

### 场景 2：Node.js + Express 后端项目

```bash
复制 boilerplate → 修改 20-backend.md（Node/Express 规范）
                → 修改 30-db-supabase.md（改成 PostgreSQL/MySQL）
                → 修改 package.json（Express 依赖）
                → npm run bootstrap:ai
                → npm run task:decompose
```

### 场景 3：Vue 全栈项目

```bash
复制 boilerplate → 修改 10-frontend.md（Vue 规范）
                → 删除/修改不需要的 rule 文件
                → npm run bootstrap:ai
                → npm run task:decompose
```

---

## 📌 Boilerplate 维护计划

### v1.0 稳定版（当前）

✅ **包含**：
- 5 个分层规则文件
- 8 个核心脚本
- 3 份完整文档
- 5 个 npm 命令

🔄 **维护**：
- 每月更新 .ai/rules/ 的最佳实践
- 根据用户反馈迭代脚本

### v2.0 规划（Q2 2026）

🚧 **新增**：
- GitHub Actions CI/CD 集成
- Pre-commit hooks（自动 sync:ai）
- TypeScript/ESLint 更严格的类型检查
- 自动化测试框架集成

### v3.0 规划（Q3 2026）

🚧 **新增**：
- 国际化支持（中文/英文规则）
- 多框架模版（React / Vue / Svelte / Next.js）
- 云部署自动化（Vercel / Netlify / Railway）

---

## 🤔 常见问题

**Q1: Boilerplate 需要 Node.js 版本要求吗？**  
A: Node.js 16+ （scripts 使用 ES modules，需要 16+）

**Q2: 如何将现有项目迁移到这个 Boilerplate？**  
A: 
```bash
# 1. 复制 .ai/, scripts/, docs/ 到现有项目
# 2. 修改 package.json 增加 5 个 npm 命令
# 3. 根据项目修改 .ai/rules/
# 4. npm run bootstrap:ai
```

**Q3: Boilerplate 支持 TypeScript 吗？**  
A: 是的。建议在项目的 tsconfig.json 中配置严格模式
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

**Q4: 规则文件能定制吗？**  
A: 完全可以。.ai/rules/ 就是为了定制。改好后运行 `npm run sync:ai` 同步到 IDE。

**Q5: 如何贡献改进到 Boilerplate？**  
A: 
```bash
# 1. 在新项目中改进 .ai/rules/ 或 scripts/
# 2. 验证效果（npm run doctor:ai）
# 3. 提交 PR 到 petconnect-app 的 boilerplate/ 分支
```

---

## 📖 使用流程

```
下载 Boilerplate
       ↓
创建新项目
       ↓
复制 .ai/ / scripts/ / docs/
       ↓
修改 .ai/rules/ (根据项目特点)
       ↓
修改 package.json (根据依赖)
       ↓
npm install
       ↓
npm run bootstrap:ai
       ↓
npm run task:decompose
       ↓
开始开发！
```

---

## 🎁 Boilerplate 交付物

| 文件 | 大小 | 说明 |
|------|-----|------|
| `.ai/` | 50 KB | 5 个规则 + manifest + skills index |
| `scripts/` | 150 KB | 8 个 Node.js 脚本 |
| `docs/` | 300 KB | AI-TASK-SYSTEM / WORKFLOW / QUICK_REFERENCE |
| `tasks/` | 10 KB | _template/ + README |
| 配置文件 | 30 KB | .gitignore / package.json / .github / .vscode |
| **总计** | ~540 KB | 完整初始化包 |

---

## 🚀 立即开始

### 方式 1：从 PetConnect 复制

```bash
git clone https://github.com/yourname/petconnect-app
cd petconnect-app

# 后续将 .ai/, scripts/, docs/, tasks/ 复制到新项目

# 或者使用提供的初始化脚本
./boilerplate-setup.sh your-new-project-name
```

### 方式 2：从 Boilerplate 专用版本

```bash
# 如果我们发布了单独的 boilerplate 仓库
git clone https://github.com/yourname/ai-engineering-boilerplate
cd ai-engineering-boilerplate

# 阅读 README 按步骤初始化
```

---

**Made with ❤️ for AI-Powered Development**

最后更新：2026-02-21
