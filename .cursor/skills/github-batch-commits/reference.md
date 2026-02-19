# 分批提交参考

## 提交信息中文乱码（Windows/PowerShell）

> **推荐方案：新提交一律使用英文，从源头避免编码问题。**  
> 格式：`<type>(<scope>): <description in English>`  
> 例如：`chore(supabase): add migrations and seed data`  
> 以下内容为历史乱码修正或极少数确需非英文时的备用方案。

### 现象

在 Windows PowerShell 下使用 `git commit -m "feat: 中文描述"` 时，中文可能被编码错误，提交历史中显示为乱码（如 `娣诲姞` 代替 `添加`）。

### 原因

PowerShell 默认编码与 Git 期望的 UTF-8 不一致，命令行直接传入的中文字符串在传递过程中被错误编码。

### 解决方案

**方式 A：使用文件传入提交信息（推荐）**

```bash
# 1. 用编辑器新建 .git/COMMIT_MSG，写入提交信息，保存为 UTF-8
#    （Cursor/VSCode 新建文件默认 UTF-8，直接粘贴 "feat: pwa添加到桌面上" 即可）

# 2. 使用 -F 从文件读取
git commit -F .git/COMMIT_MSG

# 3. 或修正上一次提交
git commit --amend -F .git/COMMIT_MSG

# 4. 提交后删除临时文件
rm .git/COMMIT_MSG
```

**方式 B：在编辑器中写提交信息**

```bash
git commit
# 或
git commit --amend
# 会打开默认编辑器，在编辑器中输入中文提交信息并保存
```

**方式 C：设置 PowerShell 编码后再执行**

```powershell
chcp 65001
git commit -m "feat: 中文描述"
```

注意：方式 C 在某些环境下仍可能乱码，优先使用方式 A。

### 修正已提交的乱码

若已推送乱码提交，需修正后强制推送：

```bash
# 1. 用编辑器新建 .git/COMMIT_MSG，写入正确信息（如 feat: pwa添加到桌面上），保存为 UTF-8

# 2. 修正最近一次提交
git commit --amend -F .git/COMMIT_MSG

# 3. 强制推送（会改写远程历史）
git push --force-with-lease

# 4. 删除临时文件（可选）
# Windows: del .git\COMMIT_MSG
# Unix: rm .git/COMMIT_MSG
```

---

## 分组示例

### 示例 1：多功能混合

**git status 输出**：
```
Changes to be committed:
  modified:   lib/api/messages.ts
  modified:   lib/api/gemini.ts
  modified:   pages/ChatDetail.tsx
  modified:   pages/Messages.tsx
  modified:   lib/utils/autoReply.ts
  modified:   supabase/add_agent_type_to_conversations.sql
  modified:   types.ts
  modified:   .env.local.example
```

**建议分组**：

| 分组 | 文件 | 提交信息 |
|------|------|----------|
| 1. Agent 类型 / 对话 | `supabase/add_agent_type_to_conversations.sql`, `types.ts` | `feat(chat): add agent_type to conversations` |
| 2. 消息 API | `lib/api/messages.ts`, `lib/api/gemini.ts` | `feat(messages): integrate Gemini API` |
| 3. 聊天 UI | `pages/ChatDetail.tsx`, `pages/Messages.tsx` | `feat(chat): update chat UI for agent type` |
| 4. 自动回复 | `lib/utils/autoReply.ts` | `feat(chat): add auto-reply utility` |
| 5. 配置 | `.env.local.example` | `chore(config): update env example` |

### 示例 2：跨目录依赖

`pages/ChatDetail.tsx` 引用 `lib/api/messages.ts`，两者同时修改 → 归入同一「聊天功能」分组。

### 示例 3：类型文件

`types.ts` 若仅为配合 `add_agent_type` 的 schema 变更，与 `supabase/add_agent_type_to_conversations.sql` 同组；若涉及多处类型调整，可单独 `chore(types)`。

---

## 边界情况

| 情况 | 处理方式 |
|------|----------|
| 文件同时属于多个功能 | 按「主功能」归属，或询问用户 |
| 仅配置文件变更 | 单独 `chore(config)` 或并入相关功能 |
| 大量小改动分散 | 按目录优先分组，再按语义微调 |
| 迁移 SQL 与 API 代码 | 若为同一 feature，可同组；否则 schema 先提交 |
| **提交信息须为英文** | 不得使用中文；若已产生乱码，用 `git commit -F <文件>` 修正，见上文 |

---

## 常用命令速查

```bash
# 查看暂存区
git diff --cached --name-only

# 取消全部暂存
git reset HEAD

# 暂存指定文件
git add path/to/file1 path/to/file2

# 提交
git commit -m "feat(scope): description"
```
