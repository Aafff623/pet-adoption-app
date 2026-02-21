# 🚀 PetConnect Quick Reference Card

## 1️⃣ 初始化命令（First Time Setup）

```bash
# macOS / Linux
bash scripts/bootstrap.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1

# 然后安装依赖
npm install
```

---

## 2️⃣ 日常命令（Daily Commands）

| 目标 | 命令 |
|------|------|
| 启动开发服务器 | `npm run dev` |
| 构建生产版本 | `npm run build` |
| 预览生产版本 | `npm run preview` |
| 同步 AI 能力 | `npm run sync:ai` |
| 同步技能库 | `npm run sync:skills` |
| 初始化 AI 配置 | `npm run bootstrap:ai` |
| 检查依赖 | `npm run doctor:ai` |

---

## 3️⃣ Git 提交模板（Commit Message）

```
<type>(<scope>): <subject>

<body>

Closes #<issue-number>
```

**类型（type）**：feat|fix|docs|style|refactor|test|chore|perf  
**范围（scope）**：adoption|pets|messages|health-diary|lost-alerts|...  
**主题**：< 50 字符，祈使式英文，首字母小写

**示例**：
```
feat(adoption-match): add AI-powered pet-person matching
fix(pet-detail): resolve image loading issue on mobile
docs(dashboard): update API endpoints guide
```

---

## 4️⃣ 任务创建（Create Task）

```bash
npm run task:new
# 按提示选择 Phase 并输入任务名称
# 自动生成: tasks/YYYY-MM-DD-<phase>-<name>/
#  ├─ spec.md (需求)
#  └─ done.md (完成记录)
```

---

## 5️⃣ 验收检查清单（Acceptance Checklist）

**每个功能都需要检查**（见 `spec.md`）：

```markdown
# Acceptance Criteria
- [ ] 数据库迁移已执行（若需要）
- [ ] 类型定义已补充到 types.ts
- [ ] API 层已实现 (lib/api/*.ts)
- [ ] 页面组件已开发 (pages/*.tsx)
- [ ] 路由已注册 (App.tsx)
- [ ] 无 TypeScript 错误
- [ ] 无 `console.log` 遗留
- [ ] 通过所有验收标准
```

---

## 6️⃣ 规则索引（Rule Files Quick Links）

| 文件 | 用途 |
|------|------|
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | 编码规范、技术栈约定 |
| [types.ts](../types.ts) | 全局类型定义 |
| [supabase/schema.sql](../supabase/schema.sql) | DB 表定义 |
| [vite.config.ts](../vite.config.ts) | 构建配置 |
| [docs/WORKFLOW.md](./WORKFLOW.md) | 工作流详细说明 |

---

## 7️⃣ 文件夹结构速览（Directory Structure）

```
lib/
  ├─ api/          ← 所有 Supabase 数据访问
  ├─ config/       ← AI 配置
  ├─ utils/        ← 工具函数
  └─ offline/      ← 离线缓存

pages/
  ├─ Home.tsx, Profile.tsx, MyPets.tsx, ...
  └─ <PascalCase>.tsx (每个路由对应一个)

components/
  ├─ BottomNav.tsx, NetworkBanner.tsx, ...
  └─ <ReusableUI>.tsx

contexts/
  ├─ AuthContext.tsx, ThemeContext.tsx, ToastContext.tsx

supabase/
  ├─ migrations/   ← DB 变更 SQL 文件
  ├─ schema.sql    ← 完整 DB 定义
  └─ seed.sql      ← 初始数据
```

---

## 8️⃣ 常见错误排查（Troubleshooting）

| 错误 | 解决方案 |
|------|---------|
| `Cannot find module 'supabase'` | `npm install` 重新安装依赖 |
| TypeScript 类型错误 | 检查 `types.ts` 中的接口定义，确保无 `any` 类型 |
| 组件无法找到返回按钮 | 参考 `.github/copilot-instructions.md` 中的"返回按钮模板" |
| Tailwind 样式未生效 | 检查 class 中是否有 `dark:` 前缀，确保仅用 Tailwind 原子类 |
| Supabase 连接失败 | 检查 `lib/supabase.ts` 中的 URL 和 Anon Key |
| 构建失败 | 执行 `npm run build` 查看完整错误，检查 `vite.config.ts` |
| `console.log` 报错 | 代码提交前必须清理所有 debug 日志 |

---

## 📋 开发流程 (Phase Implementation)

```
1. supabase/migrations/*.sql      (DB变更)
2. types.ts                        (类型定义)
3. lib/api/*.ts                    (数据访问层)
4. pages/*.tsx                     (页面组件)
5. App.tsx                         (路由注册)
6. npm run build                   (验证无错误)
```

---

**⏰ Last Updated**: 2026-02-21  
**📖 Full Guide**: See [.github/copilot-instructions.md](./.github/copilot-instructions.md)
