# 分批提交参考

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
