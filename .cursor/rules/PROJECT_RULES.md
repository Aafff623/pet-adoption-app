# Project Rules (generated)

Generated at: 2026-02-21 09:59:10 +08:00

## Source: .ai/rules/00-global.md

# Global Rules

- 使用小步可审查的变更，避免一次性大改。
- 提交信息遵循 Conventional Commits：`feat|fix|refactor|chore|docs|test|perf|build|ci`。
- 严禁提交密钥、令牌、数据库密码；使用环境变量与 `.env.local`。
- 任何 API 变更都要同步更新类型定义与调用方。
- 合并前必须通过 `typecheck`、`lint`（如有）和 `build`。
- 优先修复根因，不做表层补丁。

## Source: .ai/rules/10-frontend.md

# Frontend Rules

- 使用 React 函数组件与 Hooks，禁止类组件。
- TypeScript 严格模式，避免 `any`；必要时使用 `unknown` + 类型守卫。
- 样式使用 Tailwind 原子类，禁止内联 style（无法避免的动态计算除外）。
- 主题切换通过 `useTheme()` 与 `dark:` 前缀实现暗色适配。
- 图标统一使用 Material Icons Round：`<span className="material-icons-round">...</span>`。
- 路由使用 `react-router-dom` + Hash 路由。
- 页面结构遵循移动优先，主容器不超过 `max-w-md`。
- 返回逻辑统一：历史存在时 `navigate(-1)`，否则回首页替换跳转。

## Source: .ai/rules/20-backend.md

# Backend/API Rules

- Supabase 调用必须放在 `lib/api/*.ts`，UI 层禁止直接调用客户端。
- API 函数命名使用“动词 + 名词”，例如 `fetchLostAlerts`、`createLostAlert`。
- 每个 API 参数都定义 interface 并导出复用。
- 错误处理统一：`if (error) throw new Error(error.message)`。
- 字段映射使用显式手动映射：`snake_case -> camelCase`。
- 保持 API 返回结构稳定，避免破坏性改动。

## Source: .ai/rules/30-db-supabase.md

# Database/Supabase Rules

- 新表使用 `CREATE TABLE IF NOT EXISTS public.xxx`。
- 新索引使用 `CREATE INDEX IF NOT EXISTS idx_xxx`。
- 所有业务表必须启用 RLS：`ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY`。
- Policy 命名使用英文描述（带双引号）。
- 迁移文件放在 `supabase/migrations/`，文件名语义化。
- 已发布迁移不做原地修改，通过新增迁移修正。
- 涉及存储桶时必须补充访问策略与权限边界。

## Source: .ai/rules/40-security.md

# Security Rules

- 禁止在代码中硬编码 API Key、Token、数据库凭据。
- 禁止使用 `console.log` 提交到主分支。
- 禁止在组件中直接 import `lib/supabase.ts`。
- 禁止引入与当前任务无关的大范围文件改动。
- 敏感配置放在本地忽略文件（如 `.env.local`、`.vscode/mcp.json`）。
- 对外输入做边界校验，避免信任用户输入。

## Skills Index

- ai-features
- dark-mode-design
- deploy
- github-batch-commits
- mcp-manager
- phased-task-delivery
- project-slimming
- readme-deployment
- readme-generator
- repo-slimming
- supabase-calls
