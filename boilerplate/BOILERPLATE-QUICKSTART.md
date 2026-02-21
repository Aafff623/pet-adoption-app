# 🚀 Boilerplate 快速开始

> 一键生成 AI 工程化系统骨架，5 分钟完成新项目初始化

---

## 📦 什么是 Boilerplate？

**Boilerplate** 是这套 AI 自动化工程系统的**项目模板**。使用它可以：

✅ **一键初始化** — 生成完整的项目骨架（`.ai/rules/` + `scripts/` + `docs/` + `tasks/`）  
✅ **支持多框架** — React / Vue / Svelte / Next.js / Node.js / Python...  
✅ **预填置规范** — 规则文件预留占位符，新项目自己填  
✅ **自动配置 IDE** — 生成 Cursor / VS Code / GitHub Copilot 配置  
✅ **即插即用** — 无需手动配置，一条命令开始工作  

---

## 🚀 使用指南

### Step 1: 选择初始化方式

#### 方式 A：Node.js（推荐）

```bash
# macOS / Linux / Windows
node boilerplate-setup.mjs my-app --framework=react

# 可选框架：react | vue | svelte | next | node
node boilerplate-setup.mjs my-api --framework=node
```

#### 方式 B：Shell Script（macOS / Linux）

```bash
bash boilerplate-setup.sh my-app react
bash boilerplate-setup.sh my-api node
```

#### 方式 C：Batch Script（Windows）

```bash
boilerplate-setup.bat my-app react
boilerplate-setup.bat my-api node
```

---

### Step 2: 项目初始化完成后，按清单调整

脚本会输出一份 **检查清单**：

```
📋 下一步检查清单：

1. 进入项目目录
   cd my-app

2. 根据框架 [react] 完善 .ai/rules/ 文件
   vim .ai/rules/10-frontend.md

3. 填充 package.json 的实际依赖和脚本
   vim package.json

4. 从 PetConnect 复制文档到 docs/
   cp ../petconnect-app/docs/AI-TASK-SYSTEM.md docs/
   cp ../petconnect-app/docs/WORKFLOW.md docs/
   cp ../petconnect-app/docs/QUICK_REFERENCE.md docs/

5. 从 PetConnect 复制脚本到 scripts/
   cp -r ../petconnect-app/scripts/*.mjs scripts/

6. 初始化 npm 和 Git
   npm install
   git init
   git add .
   git commit -m "chore: initialize AI-powered development boilerplate"

7. 启动项目
   npm run bootstrap:ai
   npm run task:list
```

---

## 📁 生成的项目结构

```
my-app/
├── .ai/
│   ├── manifest.json           # 规则聚合配置
│   ├── rules/
│   │   ├── 00-global.md        # 📝TODO: 全局约束
│   │   ├── 10-frontend.md      # 📝TODO: 前端规范（根据框架填）
│   │   ├── 20-backend.md       # 📝TODO: 后端规范
│   │   ├── 30-db-supabase.md   # 📝TODO: DB 规范
│   │   └── 40-security.md      # 📝TODO: 安全规范
│   ├── mcp/
│   └── skills/
├── .cursor/
│   ├── instructions.md         # Cursor 打开时自动执行
│   └── rules/                  # 自动生成（不提交）
├── .github/
│   ├── copilot-instructions.md # GitHub Copilot 指令（📝TODO）
│   └── workflows/              # CI/CD（可选）
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── scripts/
│   ├── bootstrap.ps1           # 📝需从 PetConnect 复制
│   ├── bootstrap.sh            # 📝需从 PetConnect 复制
│   ├── decompose-task.mjs      # 📝需从 PetConnect 复制
│   ├── list-tasks.mjs          # 📝需从 PetConnect 复制
│   ├── mark-task-done.mjs      # 📝需从 PetConnect 复制
│   ├── commit-batch.mjs        # 📝需从 PetConnect 复制
│   └── ... (其他脚本)
├── docs/
│   ├── README.md
│   ├── AI-TASK-SYSTEM.md       # 📝需从 PetConnect 复制
│   ├── WORKFLOW.md             # 📝需从 PetConnect 复制
│   └── QUICK_REFERENCE.md      # 📝需从 PetConnect 复制
├── tasks/
│   ├── README.md
│   └── _template/
│       ├── spec.md
│       └── done.md
├── .gitignore
├── package.json                # ⚠️ 需要填充 dev/build 脚本
└── README.md
```

**说明**：
- 📝 = 需要根据项目特点填充
- ✅ = 已生成可用内容

---

## ✨ 三步快速开始

### 1️⃣ 初始化

```bash
node boilerplate-setup.mjs my-awesome-app --framework=react
cd my-awesome-app
```

### 2️⃣ 填充规则 & 脚本

```bash
# 编辑规则文件（根据你的框架特点）
vim .ai/rules/10-frontend.md

# 从 PetConnect 复制脚本（假设 PetConnect 在同级目录）
cp -r ../petconnect-app/scripts/*.mjs scripts/
cp -r ../petconnect-app/docs/AI-TASK-SYSTEM.md docs/
cp -r ../petconnect-app/docs/WORKFLOW.md docs/
cp -r ../petconnect-app/docs/QUICK_REFERENCE.md docs/

# 填充 package.json
npm install  # 装你真实的依赖
```

### 3️⃣ 初始化 & 开始工作

```bash
npm run bootstrap:ai            # 同步规则到 IDE
npm run task:list              # 查看任务
npm run task:decompose         # 拆解新功能需求
```

---

## 🎨 框架特定的规则示例

### React 项目

当你运行 `node boilerplate-setup.mjs my-app --framework=react` 时：

- `10-frontend.md` 会包含 React 开发建议（Hooks、TSX、Tailwind 等）
- `package.json` 会预设 React 相关脚本占位符
- `.cursor/instructions.md` 会针对 React 开发流程

**你需要**：
```bash
vim .ai/rules/10-frontend.md
# 参考 PetConnect 的 10-frontend.md，根据你的 React 版本/库的选择调整
```

### Node.js 项目

当你运行 `node boilerplate-setup.mjs my-api --framework=node` 时：

- `20-backend.md` 会包含 Node.js/Express 开发建议
- `package.json` 会预设 Node.js 脚本占位符

**你需要**：
```bash
vim .ai/rules/20-backend.md
# 根据你选择的框架（Express/Fastify/Hapi）和 ORM（Prisma/TypeORM）调整
```

---

## 📋 检查清单（初始化后）

初始化完毕后，运行这个检查清单确保一切就绪：

```bash
# 1️⃣ 检查所有规则文件是否填充了（不是 TODO）
find .ai/rules -name "*.md" -exec grep -l "TODO" {} \;
# 如果有输出，代表还有规则需要填充

# 2️⃣ 检查 npm 命令是否正确配置
npm run help 2>&1 | grep task:
# 应该看到 task:decompose / task:list 等命令

# 3️⃣ 是否能初始化
npm run bootstrap:ai
# 应该输出：✅ 所有检查通过

# 4️⃣ 能否拆解需求
npm run task:list
# 应该看到 0 个任务（首次项目是空的）

npm run task:decompose
# 输入示例需求，应该生成 tasks/ 目录

# 5️⃣ Git 是否正常
git log --oneline -n 1
# 应该看到 "chore: initialize AI-powered development boilerplate"
```

---

## 🤖 支持的框架

| 框架 | 标志 | 生成的规则文件 | 说明 |
|------|------|----------------|------|
| React | `react` | 10-frontend.md (React focused) | JSX / Hooks / Tailwind |
| Vue 3 | `vue` | 10-frontend.md (Vue focused) | Composition API / Vite |
| Svelte | `svelte` | 10-frontend.md (Svelte focused) | Reactive / Stores |
| Next.js | `next` | 10-frontend.md + 20-backend.md | Full-stack / API routes |
| Node.js | `node` | 20-backend.md (Node focused) | Express / Fastify / Pure Node |

---

## 📖 文档参考

初始化后，阅读这些文档：

1. **README.md** — 项目概述（已生成）
2. **docs/AI-TASK-SYSTEM.md** — 完整工作流指南（需从 PetConnect 复制 + 调整）
3. **.ai/rules/00-global.md** → **40-security.md** — 编码时参考

---

## 🆘 常见问题

**Q1: 如何修改生成的规则文件？**

```bash
vim .ai/rules/10-frontend.md    # 编辑前端规则
npm run sync:ai                  # 同步到 IDE
```

**Q2: 生成的 package.json 缺少依赖？**

A: 脚本只生成框架占位符，你需要自己安装：
```bash
npm install react react-dom@latest   # 安装真实依赖
npm install -D typescript @types/react
```

**Q3: 能否改变生成的目录结构？**

A: 可以，但建议保持一致便于 IDE 自动加载。如需改变，修改 boilerplate-setup.mjs 中的 `dirsToCreate` 数组。

**Q4: 脚本生成的文件有哪些是 .gitignore 忽略的？**

A: 只有 `.cursor/rules/PROJECT_RULES.md` 被忽略（自动生成，不应提交）。其他文件都应提交。

**Q5: 如何为新框架（如 Django / Flask）定制 boilerplate？**

A: 修改 boilerplate-setup.mjs，在 `generateRuleFiles()` 函数中添加新框架的规则模板。

---

## 🎁 Boilerplate 包含物

| 文件 | 大小 | 说明 |
|------|------|------|
| boilerplate-setup.mjs | 15 KB | 主初始化脚本 |
| boilerplate-setup.sh | 1 KB | Shell 包装（macOS/Linux） |
| boilerplate-setup.bat | 1 KB | Batch 包装（Windows） |
| **总计** | **17 KB** | 完整初始化工具 |

**生成的项目框架**：
- 17 个目录
- 15+ 个配置/模板文件
- 每个新项目约 100 KB（不含 node_modules）

---

## 🚀 从 Boilerplate 到生产

```
1. 运行初始化脚本
   ↓
2. 填充 .ai/rules/ 和 package.json
   ↓
3. 复制脚本 + 文档（从 PetConnect）
   ↓
4. npm install && npm run bootstrap:ai
   ↓
5. npm run task:decompose（开始工作！）
   ↓
6. npm run build（验证）
   ↓
7. npm run task:commit-batch && git push
   ↓
✨ Deploy to production
```

---

## 📞 支持 & 反馈

如发现问题或有改进建议，可以：

1. 参考 [docs/BOILERPLATE.md](docs/BOILERPLATE.md) 中的常见问题
2. 检查 [PetConnect 项目](https://github.com/yourname/petconnect-app) 的规则文件是否有更新
3. 提交 Issue 或 PR

---

**Made with ❤️ for AI-Powered Development**

最后更新：2026-02-21
