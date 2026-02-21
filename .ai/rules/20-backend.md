# Backend/API Rules

- Supabase 调用必须放在 `lib/api/*.ts`，UI 层禁止直接调用客户端。
- API 函数命名使用“动词 + 名词”，例如 `fetchLostAlerts`、`createLostAlert`。
- 每个 API 参数都定义 interface 并导出复用。
- 错误处理统一：`if (error) throw new Error(error.message)`。
- 字段映射使用显式手动映射：`snake_case -> camelCase`。
- 保持 API 返回结构稳定，避免破坏性改动。
