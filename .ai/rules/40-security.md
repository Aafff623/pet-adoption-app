# Security Rules

- 禁止在代码中硬编码 API Key、Token、数据库凭据。
- 禁止使用 `console.log` 提交到主分支。
- 禁止在组件中直接 import `lib/supabase.ts`。
- 禁止引入与当前任务无关的大范围文件改动。
- 敏感配置放在本地忽略文件（如 `.env.local`、`.vscode/mcp.json`）。
- 对外输入做边界校验，避免信任用户输入。
