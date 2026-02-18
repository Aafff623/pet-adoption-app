---
name: supabase-calls
description: Guides Supabase usage in petconnect-app including MCP tool calls, migrations, RLS, and API layer conventions. Use when working with Supabase, executing SQL, applying migrations, list_tables, execute_sql, RLS policies, or database schema changes.
---

# Supabase 调用规范

## 项目上下文

- **客户端**：[lib/supabase.ts](lib/supabase.ts) 单一实例，环境变量 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- **API 层**：`lib/api/*.ts` 封装所有 Supabase 调用，UI 不直接访问数据库
- **项目 ID**：`mjyjrdwmcvrmbovbxgtr`（MCP 调用时必传）

---

## MCP 调用规范

### 统一参数

所有 MCP 工具调用需传入 `project_id: "mjyjrdwmcvrmbovbxgtr"`。

### 工具选择

| 场景 | 工具 | 说明 |
|------|------|------|
| DDL（建表、改列、策略） | `apply_migration` | name 用 snake_case，query 为完整 SQL |
| DML / SELECT | `execute_sql` | 调试、数据校验 |
| 查看表结构 | `list_tables` | schemas 默认 `["public"]` |
| 查看迁移状态 | `list_migrations` | 无额外参数 |
| 生成 TS 类型 | `generate_typescript_types` | Schema 变更后调用 |
| 验证连接 | `list_projects` | 无参数 |

### apply_migration 示例

```json
{
  "project_id": "mjyjrdwmcvrmbovbxgtr",
  "name": "add_deleted_at_to_chat_messages",
  "query": "ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;"
}
```

### execute_sql 示例

```json
{
  "project_id": "mjyjrdwmcvrmbovbxgtr",
  "query": "SELECT id, nickname FROM profiles LIMIT 5;"
}
```

---

## Schema 与迁移

### 文件约定

- **位置**：`supabase/*.sql`
- **命名**：`add_xxx_to_yyy.sql`、`storage_policies.sql` 等
- **原则**：Schema 变更一律通过迁移，禁止手动改表

### 工作流

1. 编写 SQL 迁移文件
2. 使用 MCP `apply_migration` 或 Supabase SQL Editor 执行
3. 调用 `generate_typescript_types` 同步类型
4. 更新 `lib/api/*` 与 `types/index.ts` 以匹配新 schema

---

## 安全

- **密钥**：仅使用 anon key，`service_role` 不进入客户端
- **RLS**：所有表启用 RLS，策略需与业务访问模式一致
- **Storage**：策略在 [supabase/storage_policies.sql](supabase/storage_policies.sql)，路径 `{user_id}/{timestamp}.{ext}` 限制用户只能操作自己的目录

---

## 命名与类型

- **数据库**：snake_case（`user_id`, `created_at`）
- **应用层**：camelCase（`userId`, `createdAt`）
- **类型**：优先 `generate_typescript_types`，或手动维护 `types/index.ts`

---

## 错误处理

参考 [lib/api/profile.ts](lib/api/profile.ts)：

- 业务错误封装为自定义 Error（如 `AvatarUploadError`）
- 区分技术错误与用户可读提示（`userMessage`）
- Storage 错误按类型映射：bucket 不存在、权限、网络等

---

## Realtime

- 使用 `supabase.channel().on('postgres_changes', ...)` 订阅
- **必须**加 filter（如 `eq('conversation_id', id)`）避免全表订阅
- 用完后 `channel.unsubscribe()` 释放连接

示例（[lib/api/messages.ts](lib/api/messages.ts)）：

```typescript
supabase.channel(`chat:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, callback)
  .subscribe();
```

---

## 检查清单

Schema 变更前：

- [ ] 迁移 SQL 已写入 `supabase/*.sql`
- [ ] RLS 策略与访问模式一致
- [ ] 无 `service_role` 暴露

Schema 变更后：

- [ ] 已执行 `apply_migration` 或 SQL Editor
- [ ] 已调用 `generate_typescript_types`
- [ ] API 层与类型已更新

---

## 参考

- MCP 工具参数与表结构速查见 [reference.md](reference.md)
