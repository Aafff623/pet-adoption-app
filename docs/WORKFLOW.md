# PetConnect App 工程化工作流程

## 一、Agent 执行流程（打开项目到完成任务）

### 1.1 初始化阶段（First Time）
当 AI Agent（Cursor/Claude/Copilot）首次打开项目时：

1. **环境检查**
   - 读取 `package.json` 中的命令入口
   - 运行 `npm install`（如需要）
   - 运行 `npm run bootstrap:ai`
     - 自动生成 `.cursor/rules/PROJECT_RULES.md`（所有规则汇总）
     - 生成 `.ai/skills/index.json|md`（所有 skills 索引）
     - 检查 `.env.local` 存在性

2. **规则加载**
   - Cursor 自动读取 `.cursor/rules/PROJECT_RULES.md`（Cursor IDE 内置行为）
   - GitHub Copilot 读取 `.github/copilot-instructions.md`（如启用覆盖）
   - 项目规范已刻在所有 AI IDE 的 context 中

3. **任务理解**
   - 读取当前任务的 `tasks/YYYY-MM-DD-phaseX-feature/spec.md`
   - 从 spec.md 中获取：目标（Goal）、验收条件（Acceptance Criteria）、范围（Scope）、API/DB 变更声明
   - 读取关联的 phase 需求文档（Linked Demand Doc）以获得上下文

### 1.2 任务执行阶段

#### Step 1：理解需求
- Agent 读取 spec.md
- 识别关键约束：
  - 目标（must do）
  - 验收标准（必须全部 ✅）
  - 范围限制（不能超出）
  - API/DB 变更宣言（提前知道是否需要迁移/RLS）

#### Step 2：规范检查
- Agent 对照 `.ai/rules/` 理解约束：
  - `.ai/rules/00-global.md`：通用工程规范（Conventional Commits、禁密钥等）
  - `.ai/rules/10-frontend.md`：组件/路由/样式规范
  - `.ai/rules/20-backend.md`：API 层规范（禁止直连 supabase、公开 interface）
  - `.ai/rules/30-db-supabase.md`：DB 变更规范（必须 RLS、迁移语义化）
  - `.ai/rules/40-security.md`：红线（禁 any、禁 console.log、禁内联 style）

#### Step 3：制定执行计划（Plan）
- **单阶段任务（spec 明确）**：直接执行变更
- **多步骤任务**：按优先级拆解为：
  1. DB 变更（migration + RLS policy）→ 提交
  2. API 层（lib/api/*.ts）→ 调整权限/类型 → 提交
  3. 页面/组件层 → 提交
  4. 测试验证 → 最终提交

Plan 格式（可选写在任务备注中）：
```
# Plan
- [ ] Step 1: Add migration for xxx (supabase/migrations/)
- [ ] Step 2: Implement API layer (lib/api/xxx.ts)
- [ ] Step 3: Update pages (pages/*.tsx)
- [ ] Step 4: E2E test verification
```

#### Step 4：分阶段实施
- 遵循"小步可审查"原则：每次改动 3-5 个相关文件
- 每次改动后立即 commit（使用 Conventional Commits 格式）
- 如遇到规范冲突，优先遵循 `.ai/rules/`

#### Step 5：提交代码
见下文"提交规范"

#### Step 6：验收与标记
- 运行 `npm run build` 验证无编译错误
- 对照 spec.md 的 Acceptance Criteria 逐项核验（✅ / ❌）
- 若全部通过，填写 `done.md` 并标记任务完成

---

## 二、任务分派与拆解机制

### 2.1 任务分派流程

**从需求到任务**

```
需求文档（docs/demand/phaseX-xxx.md）
         ↓
   人工阅读 & 理解
         ↓
npm run task:new -- docs/demand/phaseX-xxx.md feature-slug
         ↓
创建目录 tasks/YYYY-MM-DD-phaseX-feature/
├── spec.md（包含 Goal/验收标准/范围/API-DB声明）
└── done.md（完成后填写变更清单+测试记录）
         ↓
分派给 Agent（开发）/ 人工（review）
```

### 2.2 任务拆解策略

#### 小任务（单文件/单表改动）：
- 直接执行，一次 commit

#### 中任务（API+页面改动）：
- 拆解为 API → 页面 两个 PR，分别验收

#### 大任务（跨模块/多 phase 依赖）：
- **建议拆成多个 task**，而非在一个 task 里塞满
- 示例：phase-2-ai-adoption-match 太大，拆成：
  - task-1：AI 模型接入 + API
  - task-2：Match 算法实现
  - task-3：UI 展示层

#### DB 变更拆解：
- Migration 永远 **单独优先提交**
- 确认迁移成功后再做应用层适配
- Seed 数据（如需）在迁移中完成

### 2.3 并行开发支持

若多个 Agent 并行处理：

```
Phase-2 拆成 3 个 task：
├── task-api（Agent 1）
├── task-ui（Agent 2）
└── task-test（Agent 3）

约束条件：
- task-api 完成 + merge 后，task-ui 才能 merge
- 各 agent 可提交 feature/* 分支
- 最终由人工做 main merge 时的调度
```

---

## 三、提交规范

### 3.1 Conventional Commits 格式

**必须遵循**：

```
<type>(<scope>): <subject> [#issue-id]
[optional body]
[optional footer]
```

#### Type 列表
- `feat` - 新功能
- `fix` - 修复 bug
- `refactor` - 代码重构（不改功能）
- `chore` - 构建/文档/依赖（非代码改动）
- `docs` - 文档
- `test` - 测试
- `perf` - 性能优化
- `build` - 构建系统
- `ci` - CI 流程改动

#### Scope（可选但推荐）
按功能/模块，例如：
- `(api)` - lib/api/*
- `(pages/lost-alerts)` - pages/LostAlerts.tsx
- `(db/supabase)` - 数据库变更
- `(ai-agents)` - AI 功能

#### 示例
```
feat(ai-agents): add Doubao provider support
- Integrate Tongyi Qwen SDK
- Support model switching via VITE_LLM_PROVIDER
- Add rate limiting per agent

fix(pages/adoption): resolve navigation back on desktop view

refactor(api/pets): unify snake_case -> camelCase mapping

docs(readme): add deployment guide for Vercel
```

### 3.2 提交时的检查清单

每次 commit 前必须通过：

```
□ npm run build        # 编译无误
□ 代码无 console.log   # 或仅开发用且标记 TODO
□ 无硬编码 API Key     # 使用环境变量
□ 无 any 类型         # TypeScript 严格
□ 无内联 style        # 使用 Tailwind
□ 如涉及 API：有类型定义与导出
□ 如涉及 DB：有迁移文件 + RLS 声明
□ 对照 spec.md 验收标准对齐
```

### 3.3 PR 提交规范（如使用 GitHub）

**标题**：遵循 Conventional Commits

**描述**：
```markdown
## 关联任务
- Task: tasks/YYYY-MM-DD-phaseX-xxx/spec.md

## 变更摘要
- 新增了 xxx 功能
- 修改了 yyy 接口
- 数据库新增表 zzz

## 验收检查
- [x] 编译通过 (npm run build)
- [x] 关键路径测试
- [x] 对标 Acceptance Criteria

## 预览链接
- Vercel Preview: https://...
```

---

## 四、计划制定（Plan）

### 4.1 人工制定 Plan 的时机

**需要显式制定 Plan 的情况：**
- 任务很大（超 8 小时工作量）
- 涉及多个模块交互
- 有复杂依赖关系
- 需要多 agent 并行

### 4.2 Plan 模板

```markdown
# Plan for tasks/2026-02-21-phase2-ai-adoption-match

## 目标
实现宠物领养 AI 智能匹配推荐系统。

## 约束
- 必须复用 pet_match_score 表（已存在）
- 必须通过 AI agent 调用 LLM 进行匹配评分
- 使用 Gemini API（可切换至 DeepSeek）

## 分解任务

### Part A: API 层（1-2h）
- [x] Add migration: add_adoption_match_scores.sql
  - 新表 adoption_match_scores（pet_id, user_id, score, reason...）
  - 启用 RLS：users 只能看自己的 match
- [ ] lib/api/adoptionMatch.ts（新文件）
  - calculateMatchScore(petId, userId): Promise<MatchResult>
  - 调用 generateMatchAnalysis() 从 LLM 获取评分理由
- [ ] 更新 types.ts 增加 AdoptionMatch interface

### Part B: 页面层（1-2h）
- [ ] pages/Home.tsx
  - 新增"为你推荐"卡片区
  - 调用 adoptionMatch API
- [ ] components/PetMatchCard.tsx（新组件）
  - 展示得分 + 推荐理由

### Part C: 测试（30min）
- [ ] E2E: 打开首页 → 看到推荐卡片
- [ ] Verify LLM 调用正常（logs）

## 检查点（blocking）
- Part A merge 后才能 Part B start
- 迁移成功后（生产检验）才能上控制面板

## 预计工期
- Total: 3-4h
- 可并行：Part B 和 C（需要 Part A 的类型）
```

### 4.3 Agent 自动推导 Plan

若 Agent 聪慧，可从 spec.md 自动推导出基础 plan：

```
读取 spec.md：
- Goal ✅
- Acceptance Criteria ✅ (4 items)
- Scope (In/Out)
- API/DB Change Declaration

自动推导：
→ 需要迁移吗？YES → DB Part
→ 需要 API 改动吗？YES → API Part
→ 涉及页面吗？YES → UI Part
→ 有 E2E 测试点吗？YES → Test Part

输出 Plan：
- [ ] DB: xxx migration + RLS
- [ ] API: lib/api/xxx.ts + types update
- [ ] UI: pages/xxx + components/yyy
- [ ] Test: Verify acceptance criteria
```

---

## 五、关键约束与红线

### 5.1 Must-Do（绝对遵循）

| 规则 | 来源 | 影响 |
|------|------|------|
| Conventional Commits | `.ai/rules/00-global.md` | PR 合并检查 |
| 禁直连 supabase | `.ai/rules/20-backend.md` | Code review 拒绝 |
| 迁移必有 RLS | `.ai/rules/30-db-supabase.md` | 安全策略 |
| TypeScript 无 any | `.ai/rules/40-security.md` | Lint 失败 |
| 禁硬编码 key | `.ai/rules/40-security.md` | Git pre-commit hook（可选） |

### 5.2 Review 检查清单

当 PR 需要 review 时：

- **Spec vs. Code**：实现是否对应 Acceptance Criteria
- **规范**：是否遵循 5 个 rules 文件的约束
- **类型**：API 返回是否有 interface 定义 & 导出
- **DB**：迁移是否有 Policy & RLS 启用声明
- **样式**：是否用 Tailwind（无硬编码色值）
- **安全**：禁 key、禁 console.log（生产）
- **测试**：关键路径是否覆盖

---

## 六、实际工作流示例

### 示例：实现"失控宠物告警功能"

**前置**
```bash
# 初始化
npm run bootstrap:ai

# 查看当前任务
cat tasks/2026-02-21-phase1-lost-alert-mvp/spec.md
```

**第 1 阶段：制定 Plan**
- 读 spec.md 理解验收标准（3-5 条）
- 理解关联 phase 文档：phase-1-lost-alert-mvp.md 的详细需求
- 拆解为 DB → API → UI 三个 part

**第 2 阶段：DB 创建**
```bash
# 创建迁移文件
supabase migration new add_lost_pet_alerts

# 编写 SQL（含 RLS）
CREATE TABLE public.lost_pet_alerts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  pet_id UUID NOT NULL,
  ...
);
ALTER TABLE public.lost_pet_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own alerts" ...
```

**第 3 阶段：API 开发**
```typescript
// lib/api/lostAlerts.ts
export interface CreateLostAlertRequest {
  petId: string;
  description: string;
  photoUrls: string[];
}

export async function createLostAlert(
  req: CreateLostAlertRequest,
  userId: string
): Promise<LostAlert> {
  // 调用 supabase 仅在 lib/api 里
}
```

**第 4 阶段：提交**
```bash
git add supabase/migrations/add_lost_pet_alerts.sql
git commit -m "feat(db/lost-alerts): add lost_pet_alerts table with RLS"

git add lib/api/lostAlerts.ts types.ts
git commit -m "feat(api/lost-alerts): implement createLostAlert & fetchLostAlerts"

git add pages/PublishLostAlert.tsx
git commit -m "feat(pages): add publish lost alert page"

# 验证
npm run build
npm run doctor:ai
```

**第 5 阶段：验收与标记**
```bash
# 对照 spec.md Acceptance Criteria
- [x] 用户可发布宠物丢失告警
- [x] 非发布者看不到详情
- [x] 地图选址正常
- [x] 照片上传成功

# 填写任务完成记录
cat > tasks/2026-02-21-phase1-lost-alert-mvp/done.md << 'EOF'
# Done

## What changed
- 新增 lost_pet_alerts 表 + RLS policies
- 实现告警发布 API 与前端页面

## Files touched
- supabase/migrations/add_lost_pet_alerts.sql
- lib/api/lostAlerts.ts
- pages/PublishLostAlert.tsx
- types.ts

## Test checklist
- [x] 本地功能验证（能创建、能查看、权限生效）
- [x] 关键路径回归（旧页面页面不受影响）
- [x] 异常场景验证（无地址时提示）

## Build result
✅ npm run build 通过，无警告

## Preview/Prod links
- Preview: https://petconnect-feat-branch.vercel.app
- Production: （待 main 合并后）
EOF
```

---

## 七、常见问题

### Q: 如何判断一个改动是否应该拆成多个 commit？
**A**: 遵循"单一职责"原则
- DB 改动 → 单独 commit
- API 新增 → 单独 commit
- 页面更新 → 单独 commit
- 类型定义 → 可合并到相关 commit
- 评论/日志 → 同类逻辑 commit

### Q: 如果实现过程中发现 spec 不清楚怎么办？
**A**: 向任务发起人反馈（备注在 done.md）
```markdown
## 疑问
- Q: adoption_score 是 1-100 还是 0-1 范围？
- Q: 匹配失败时是否应该给用户提示？
```

### Q: 多个 agent 在不同 branch 上改同一文件怎么办？
**A**: 按 phase 拆成 **不同 task 目录**，而非一个 task 多人干
- task-1-ai-adoption-phase2：Agent 1
- task-2-adoption-match-ui：Agent 2
- 不同 feature/* 分支，main 时统一调度

### Q: 如何快速同步最新规则？
**A**: 
```bash
# 项目所有者编改 .ai/rules/* 后
npm run sync:ai          # 重新生成 PROJECT_RULES.md
git add .ai/rules/ .cursor/rules/PROJECT_RULES.md
git commit -m "docs(rules): update xxx constraint"

# 其他 agent 拉最新代码后
npm run bootstrap:ai     # 自动刷新所有规则和索引
```

---

## 总结

| 阶段 | 谁做 | 用什么 | 输出 |
|------|------|--------|------|
| **需求理解** | Agent | spec.md + 相关 rules | Plan（可选显式写，也可隐式推导） |
| **代码实现** | Agent | `.ai/rules/` + IDE 智能提示 | 多个 Conventional Commits |
| **代码提交** | Agent | git + GitHub | Feature PR |
| **验收** | 人工/Agent | Acceptance Criteria checklist | done.md 标记 |
| **merge & deploy** | 人工 | main branch + Vercel | 🚀 Production |

**核心思想**：规则明确 → 任务清晰 → agent 执行无疑 → 交付快速可重复 ✌️
