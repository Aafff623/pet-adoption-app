# Database/Supabase Rules

- 新表使用 `CREATE TABLE IF NOT EXISTS public.xxx`。
- 新索引使用 `CREATE INDEX IF NOT EXISTS idx_xxx`。
- 所有业务表必须启用 RLS：`ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY`。
- Policy 命名使用英文描述（带双引号）。
- 迁移文件放在 `supabase/migrations/`，文件名语义化。
- 已发布迁移不做原地修改，通过新增迁移修正。
- 涉及存储桶时必须补充访问策略与权限边界。
