# 🤖 AI 任务自动拆解系统

> 核心理念：**一个需求 → AI 自动拆解为 3-5 个 subtasks → 自动创建文件夹结构 → Agent 智能完成**

---

## 📋 完整工作流

```
┌────────────────────────────────────────────────┐
│ 1️⃣ 首次打开项目（Agent）                       │
│   npm run bootstrap:ai  # 自动初始化规则、技能 │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 2️⃣ 查看当前待做任务                           │
│   npm run task:list  # 显示进度 / 更新时间     │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 3️⃣ 提出新功能需求                            │
│   npm run task:decompose  # 交互式创建        │
│   - 输入：功能主题                             │
│   - 输入：具体需求（多行）                     │
│   ↓ LLM 分析 ↓                                 │
│   自动生成：tasks/2026-02-21-featurename/  │
│     ├── parent-spec.md    (总体目标)           │
│     └── subtasks/                              │
│        ├── 01-types-definitions/               │
│        ├── 02-api-implementation/              │
│        ├── 03-ui-components/                   │
│        ├── 04-pages-integration/               │
│        └── 05-testing-validation/ (可选)       │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 4️⃣ Agent 读取第一个 subtask                  │
│   cat tasks/.../subtasks/01-types/.../spec.md │
│   → 自动调用 .ai/rules/ 规范                  │
│   → 在 Cursor 中自动加载 PROJECT_RULES.md     │
│   → 开始编码                                   │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 5️⃣ 完成一个 subtask                          │
│   npm run task:mark-done -- tasks/.../01-... │
│   ↓ 自动：                                    │
│   - 验证 npm run build 通过 ✅                 │
│   - 生成 done.md（Files touched 自动填充）   │
│   - 等待人工或 AI 审核打钩 ☑️                  │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 6️⃣ 继续下一个 subtask（重复 4-5）            │
│   types → api → components → pages            │
└────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│ 7️⃣ 所有 subtasks 完成后分批提交              │
│   npm run task:commit-batch -- tasks/...     │
│   ↓ 按功能阶段自动分组：                      │
│   [1] git commit "feat(types): add interfaces" │
│   [2] git commit "feat(api): implement logic"  │
│   [3] git commit "feat(components): add UI"    │
│   [4] git commit "feat(pages): integrate"      │
│   ↓                                           │
│   git push                                    │
│   ↑ 所有提交符合 Conventional Commits         │
└────────────────────────────────────────────────┘
```

---

## 🎯 核心命令速查

### Step 1: 初始化项目

```bash
# 首次打开项目时自动运行
npm run bootstrap:ai
# 输出：
# ✅ .ai/rules/ → 加载
# ✅ .cursor/rules/PROJECT_RULES.md → 生成
# ✅ .ai/skills/index.json → 索引
```

### Step 2: 查看待做任务

```bash
npm run task:list

# 输出示例：
# 📋 待做任务列表
# ────────────────────────────────────────────
# 1. 🟡 2026-02-21-adoption-match
#    📂 tasks/2026-02-21-adoption-match
#    📊 进度: [████████░░░░░░░░░░░░] 40%
#    ⏰ 最后更新: 2h 前
#
# 2. 📝 2026-02-21-health-diary
#    📂 tasks/2026-02-21-health-diary
#    📊 进度: [░░░░░░░░░░░░░░░░░░░░] 0%
#    ⏰ 最后更新: 最近
```

### Step 3: 拆解新功能需求

```bash
npm run task:decompose

# 交互式输入：
# ─────────────────────────────────
# 🎯 功能主题: AI 宠物匹配推荐
# 📝 具体需求 (按 Ctrl+D 或空行结束):
# > 基于用户偏好和宠物特征计算兼容度
# > UI 展示匹配分数 + AI 推荐理由
# > 后台任务定期重新计算分数
# >
# ⏳ LLM 正在分析需求...
#
# ✅ 已创建任务结构: tasks/2026-02-21-adoption-match
#
# 📁 文件夹树：
# tasks/2026-02-21-adoption-match/
# ├── parent-spec.md
# └── subtasks/
#    ├── 01-types-definitions/
#    │  ├── spec.md
#    │  └── done.md
#    ├── 02-api-implementation/
#    │  ├── spec.md
#    │  └── done.md
#    ├── 03-ui-components/
#    │  ├── spec.md
#    │  └── done.md
#    ├── 04-pages-integration/
#    │  ├── spec.md
#    │  └── done.md
#    └── 05-testing-validation/ (可选)
#       ├── spec.md
#       └── done.md
```

### Step 4: Agent 读取 subtask

```bash
# Agent 自动发现并读取待做 subtask
cat tasks/2026-02-21-adoption-match/subtasks/01-types-definitions/spec.md

# 输出：目标、验收标准、范围、API/DB 变更声明
# ↓ 自动调用区域规则 ↓
# .ai/rules/ 中的约束自动生效
# Types must: no `any`, strict mode, TS 5.8
```

### Step 5: 标记任务完成

```bash
# 完成 subtask 后标记
npm run task:mark-done -- tasks/2026-02-21-adoption-match/subtasks/01-types-definitions

# 可选参数: --auto-check (允许 AI 自动打钩)
npm run task:mark-done -- tasks/.../01-... --auto-check

# 输出：
# ✅ Acceptance Criteria:
#   ☑️ types.ts 中新增接口
#   ☑️ 无 any 类型
#   ☑️ 通过 TypeScript 检查
#
# 📝 已改动文件:
#   • types.ts
#   • lib/api/adoptionMatch.ts
#
# 🔨 验证构建...
#   ✅ npm run build 通过
#
# ✅ 已生成: done.md
#    所有验收标准已自动打钩 ☑️
```

### Step 6: 分批提交代码

```bash
# 所有 subtasks 完成后，分批提交
npm run task:commit-batch -- tasks/2026-02-21-adoption-match

# 输出：
# 📦 分批提交任务代码
# ────────────────────────────────
# 发现 12 个改动文件
#
# 类型定义:
#   - types.ts
# ✅ 已提交: feat(types): 类型定义 (1 file)
#
# API 实现:
#   - lib/api/adoptionMatch.ts
#   - lib/api/llm.ts (调用)
# ✅ 已提交: feat(api): API 实现 (2 files)
#
# UI 组件:
#   - components/AdoptionMatchCard.tsx
#   - components/common.tsx (修改)
# ✅ 已提交: feat(components): UI 组件 (2 files)
#
# 页面集成:
#   - pages/Home.tsx
# ✅ 已提交: feat(pages): 页面集成 (1 file)
#
# ✅ 成功提交 4 个 commit
# 📖 下一步：
#   git push
```

---

## 🧠 LLM 拆解策略

系统对常见功能类型进行**智能拆解**：

### 🔍 AI 匹配功能（如：领养匹配）

拆解为 **5 个 subtasks**：
1. **类型定义** — interfaces、data models
2. **API 实现** — calculateScore()、LLM 集成、缓存
3. **UI 组件** — 卡片展示、加载态、错误态
4. **页面集成** — 首页推荐区、登录提示
5. **测试验收** — E2E、性能、Acceptance Criteria

### 💊 健康监测功能（如：宠物健康日记）

拆解为 **3-4 个 subtasks**：
1. **数据库设计** — schema、RLS、迁移脚本
2. **API CRUD** — create、read、update、delete
3. **UI 列表** — 展示、分页、过滤
4. **测试** — 功能验证

### 🆘 救助任务功能

拆解为 **3-4 个 subtasks**：
1. **数据结构** — 任务表、状态机、权限
2. **业务逻辑** — 发布、分配、进度更新
3. **页面看板** — 任务列表、详情、实时更新

### 📋 默认拆解（通用功能）

如果无法识别，拆解为 **4 个标准 subtasks**：
1. **类型定义** — 数据模型
2. **API 层** — 数据访问
3. **UI 组件** — 交互界面
4. **集成测试** — 完整验收

---

## 🔄 完整示例：AI 宠物匹配功能

### 场景

你的需求：
```
功能主题：AI 宠物匹配推荐
具体需求：
- 基于用户偏好和宠物特征计算兼容度
- UI 展示匹配分数 (1-100) + AI 推荐理由
- 后台任务定期重新计算分数
```

### 执行流程

```bash
# 1️⃣ 打开项目
npm run bootstrap:ai

# 2️⃣ 查看当前任务
npm run task:list

# 3️⃣ 拆解新需求
npm run task:decompose
# 输入上述需求后自动生成

# 4️⃣ 查看生成的结构
npm run task:list

# 输出：
# 📝 2026-02-21-adoption-match (已创建)
#    📊 进度: [██░░░░░░░░░░░░░░░░░░] 10%
```

### Subtask 1: 类型定义

```bash
# Agent 读取 spec
cat tasks/2026-02-21-adoption-match/subtasks/01-types-definitions/spec.md

# Goal: 定义 TypeScript 接口、数据模型
# Acceptance Criteria:
# - [ ] types.ts 新增 AdoptionMatch interface
# - [ ] DB schema 设计（adoption_match_scores 表）
# - [ ] 无 any 类型

# Agent 编码（遵循 .ai/rules/ 自动生效）：
vi types.ts
# +interface AdoptionMatch {
# +  score: number;        // 1-100
# +  reason: string;       // AI 推荐理由
# +  calculatedAt: Date;
# +}

npm run build  # ✅ 通过

# 标记完成
npm run task:mark-done -- tasks/2026-02-21-adoption-match/subtasks/01-types-definitions --auto-check
```

### Subtask 2: API 实现

```bash
cat tasks/2026-02-21-adoption-match/subtasks/02-api-implementation/spec.md

# Goal: 实现 calculateMatchScore() 调用 LLM
# Acceptance Criteria:
# - [ ] lib/api/adoptionMatch.ts 创建
# - [ ] calculateMatchScore() 返回正确格式
# - [ ] 成功调用 lib/api/llm.ts

# Agent 编码：
vi lib/api/adoptionMatch.ts
# +export const calculateMatchScore = async (petId, userId) => {
# +  const analysis = await generateMatchAnalysis(petId, userId);
# +  return { score: analysis.score, reason: analysis.reason };
# +};

npm run build  # ✅ 通过
npm run task:mark-done -- tasks/.../02-api-implementation --auto-check
```

### Subtask 3: UI 组件

```bash
cat tasks/2026-02-21-adoption-match/subtasks/03-ui-components/spec.md

# Agent 编码：
vi components/AdoptionMatchCard.tsx
# +export const AdoptionMatchCard = ({ score, reason }) => (
# +  <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4">
# +    <div className="text-3xl font-bold text-primary">{score}</div>
# +    <p className="text-sm text-gray-600 dark:text-gray-300">{reason}</p>
# +  </div>
# +);

npm run build
npm run task:mark-done -- tasks/.../03-ui-components --auto-check
```

### Subtask 4: 页面集成

```bash
cat tasks/2026-02-21-adoption-match/subtasks/04-pages-integration/spec.md

# Agent 编码：
vi pages/Home.tsx
# +import AdoptionMatchCard from '../components/AdoptionMatchCard';
# +
# +export const Home = () => {
# +  const [match, setMatch] = useState(null);
# +  useEffect(() => {
# +    calculateMatchScore(...).then(setMatch);
# +  }, []);
# +  return <AdoptionMatchCard {...match} />;
# +};

npm run build
npm run task:mark-done -- tasks/.../04-pages-integration --auto-check
```

### Subtask 5: 测试验收

```bash
cat tasks/2026-02-21-adoption-match/subtasks/05-testing-validation/spec.md

# 本地测试 + npm run build
npm run build  # ✅

npm run task:mark-done -- tasks/.../05-testing-validation --auto-check
```

### 分批提交所有完成

```bash
npm run task:commit-batch -- tasks/2026-02-21-adoption-match

# 输出 4 个 commit：
# ✅ feat(types): 类型定义及数据模型
# ✅ feat(api): AI 匹配分数计算实现
# ✅ feat(components): 匹配卡片 UI 组件
# ✅ feat(pages): 首页集成推荐功能

git push
# → Vercel 自动部署 Preview 链接
```

---

## 🎛️ 命令参考

| 命令 | 用途 | 例子 |
|------|------|------|
| `npm run task:decompose` | 🤖 交互式拆解新需求 | `npm run task:decompose` |
| `npm run task:list` | 📋 查看所有待做任务 | `npm run task:list` |
| `npm run task:new` | 📝 从 phase 文档创建 | `npm run task:new -- docs/demand/.../phase-2.md match-ui` |
| `npm run task:mark-done` | ✅ 标记 subtask 完成 | `npm run task:mark-done -- tasks/.../01-types [--auto-check]` |
| `npm run task:commit-batch` | 📦 分批提交 | `npm run task:commit-batch -- tasks/2026-02-21-feature` |
| `npm run bootstrap:ai` | 🚀 首次初始化 | `npm run bootstrap:ai` |
| `npm run sync:ai` | 🔄 刷新规则 | `npm run sync:ai` |

---

## 📌 关键特性

✅ **自动拆解** — LLM 分析需求，生成 3-5 个 subtasks  
✅ **文件夹管理** — 每个功能一个主文件夹 + N 个 subtasks  
✅ **进度追踪** — 显示完成% / 最后更新时间  
✅ **规范自动生效** — 打开 IDE 时自动加载 .ai/rules/  
✅ **智能标记** — done.md 自动验证+打钩（可选 --auto-check）  
✅ **分批提交** — 按功能阶段（types→api→ui→pages）自动分组  
✅ **Build 验证** — 每步都要通过 npm run build  
✅ **Conventional Commits** — 所有 commit 都符合规范  

---

## 🔮 常见问题

**Q1: Agent 是否需要首先运行 `npm run bootstrap:ai`?**  
A: 是的。首次打开项目时需要初始化规则、技能、MCP 配置。建议加入 `.cursor/rules/` 中的初始化指令。

**Q2: 如何让 AI 自动打钩 done.md?**  
A: 使用 `--auto-check` 参数：
```bash
npm run task:mark-done -- tasks/.../01-types --auto-check
```

**Q3: 分批提交的顺序能改吗?**  
A: 当前顺序固定为：types → db → api → components → pages → styles → tests → other
如需调整，可修改 `scripts/commit-batch.mjs` 中的 `commitOrder` 数组。

**Q4: 未完成的 subtask 能删除吗?**  
A: 可以，直接删除对应文件夹：
```bash
rm -rf tasks/2026-02-21-feature/subtasks/03-ui-components
```

**Q5: 如何查看某个 subtask 的 Acceptance Criteria?**  
A:
```bash
cat tasks/2026-02-21-feature/subtasks/01-types/spec.md | grep -A 5 "Acceptance Criteria"
```

---

## 🚀 下一步

1. **首次体验**：
   ```bash
   npm run task:decompose
   # 输入：宠物健康日记 / 监控健康指标 / 异常告警 / 医疗历史 / <Enter>
   ```

2. **查看生成结果**：
   ```bash
   npm run task:list
   ls tasks/2026-02-21-health-diary/subtasks/
   ```

3. **开始开发第一个 subtask**：
   ```bash
   cat tasks/2026-02-21-health-diary/subtasks/01-db-design/spec.md
   # → Agent 开始编码
   ```

4. **完成后分批提交**：
   ```bash
   npm run task:commit-batch -- tasks/2026-02-21-health-diary
   git push
   ```

---

**Made with ❤️ for PetConnect AI Development**
