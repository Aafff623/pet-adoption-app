---
name: github-batch-commits
description: Analyzes staged and modified files, groups them by feature, and guides batch commits. Use when the user says "提交到Github", "提交到 GitHub", "push to GitHub", or has many staged files from multiple features and wants to commit by feature.
---

# GitHub 分批提交 (Batch Commits by Feature)

**触发词**：用户说「提交到Github」「提交到 GitHub」「push to GitHub」等时，执行本流程。

## 适用场景

- 多开对话完成不同功能后，暂存区积累大量文件
- 需要按功能分批提交，保持提交历史清晰
- 需要检查每个功能涉及的文件是否完整、无遗漏

---

## 执行流程

### Step 1：获取变更状态

```bash
git status
```

区分：
- **已暂存** (staged)：`Changes to be committed`
- **未暂存** (modified)：`Changes not staged for commit`
- **未跟踪** (untracked)：`Untracked files`

### Step 2：按功能分组文件

使用以下启发式规则对文件分组（优先级从高到低）：

| 规则 | 说明 | 示例 |
|------|------|------|
| 目录归属 | 同目录下文件通常属于同一功能 | `lib/api/messages.ts` + `lib/api/gemini.ts` → api |
| 功能前缀 | 文件名或路径含功能关键词 | `add_agent_type_*.sql` → agent 功能 |
| 依赖关系 | 互相 import 或引用 | `ChatDetail.tsx` ↔ `lib/api/messages.ts` → 聊天功能 |
| 类型聚合 | 同类型变更 | `*.sql` → schema；`*.tsx` → UI |

**分组输出格式**：

```markdown
## 功能 A：xxx
- path/to/file1.ts
- path/to/file2.tsx

## 功能 B：yyy
- path/to/file3.sql
- path/to/file4.ts
```

### Step 3：校验分组

对每个分组：
- [ ] 文件是否语义相关（同一功能）
- [ ] 是否遗漏依赖（如 API 变更但未包含调用方）
- [ ] 是否混入无关文件（需移到其他分组）

### Step 4：分批提交

对每个分组依次执行：

```bash
# 1. 若文件已全部暂存，先 unstage 全部
git reset HEAD

# 2. 仅暂存当前分组文件
git add <file1> <file2> ...

# 3. 提交（使用 Conventional Commits 风格）
git commit -m "feat(scope): 简短描述"
```

**注意**：若提交信息含中文且在 Windows/PowerShell 下出现乱码，改用 `git commit -F <文件>` 从 UTF-8 文件读取，详见 [reference.md#提交信息中文乱码](reference.md#提交信息中文乱码windowspowershell)。

**提交信息格式**（Conventional Commits）：

| 类型 | 用途 |
|------|------|
| `feat(scope)` | 新功能 |
| `fix(scope)` | 修复 |
| `refactor(scope)` | 重构 |
| `chore(scope)` | 配置、依赖、脚本 |
| `docs(scope)` | 文档 |

### Step 5：重复直至完成

每完成一批提交后，再次运行 `git status` 确认剩余文件，继续分组提交。

---

## 分组启发式细则

### 常见项目结构对应

| 路径模式 | 建议 scope/功能名 |
|----------|-------------------|
| `lib/api/*.ts` | api |
| `pages/*.tsx` | 页面名（如 chat、messages） |
| `supabase/*.sql` | schema / migration |
| `lib/utils/*.ts` | utils |
| `types.ts` | 随主功能（若仅类型变更可单独 `chore(types)`） |
| `.env*.example` | config |

### 跨目录关联

若 `pages/ChatDetail.tsx` 与 `lib/api/messages.ts` 同时修改，且语义相关（如聊天功能），应归入同一分组。

### 无法明确分组时

- 询问用户该文件属于哪个功能
- 或单独成组，用 `chore` 或 `fix` 提交

---

## 检查清单

提交前：
- [ ] 已运行 `git status` 获取完整变更
- [ ] 分组结果已展示给用户确认
- [ ] 每组文件语义一致
- [ ] 提交信息符合 Conventional Commits

提交后：
- [ ] `git status` 无遗漏
- [ ] `git log -3` 查看最近提交是否清晰

---

## 参考

- 分组示例与边界情况见 [reference.md](reference.md)
