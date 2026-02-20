# GitHub Copilot 项目指令 — PetConnect App

## 项目概述
PetConnect 是一款宠物领养与救助 PWA，使用 **React + TypeScript + Vite + Tailwind CSS + Supabase**。

---

## 技术栈约定

- **框架**：React 18，函数式组件 + Hooks，严禁使用类组件
- **语言**：TypeScript（严格模式），所有函数/组件必须有类型注解
- **样式**：Tailwind CSS（原子类），禁止内联 style，深色模式用 `dark:` 前缀
- **路由**：`react-router-dom` v6，Hash 路由（`HashRouter`）
- **后端**：Supabase（`lib/supabase.ts`），**UI 层禁止直接调用 supabase，必须通过 `lib/api/*.ts`**
- **图标**：Material Icons Round（`<span className="material-icons-round">icon_name</span>`）
- **主题**：通过 `useTheme()` 获取 `resolvedTheme`，`dark:` 类适配暗色

---

## 文件结构规范

```
lib/api/          ← 所有 Supabase 数据访问层，每个模块一个文件
pages/            ← 页面组件，文件名 PascalCase，与路由对应
components/       ← 可复用 UI 组件
contexts/         ← React Context（Auth / Theme / Toast）
types.ts          ← 全局类型定义，所有共享接口在此声明
supabase/migrations/ ← 数据库变更 SQL，文件名语义化
```

---

## 编码规范

### React 组件
- 每个页面底部导出 `export default ComponentName`
- 使用 `useNavigate` 跳转，返回：`if (window.history.length > 1) navigate(-1); else navigate('/', { replace: true })`
- Toast 提示：`const { showToast } = useToast()`
- 认证状态：`const { user, profile } = useAuth()`

### API 层（lib/api/*.ts）
- 函数命名：动词 + 名词，如 `fetchLostAlerts`, `createLostAlert`
- 错误处理：`if (error) throw new Error(error.message)`
- 数据库字段映射：snake_case → camelCase（手动 map，不依赖自动转换）
- 所有参数用 interface 定义，导出供页面使用

### 样式约定
- 移动优先，最大宽度容器不超过 `max-w-md`
- 主色调：`bg-primary`, `text-primary`（CSS 变量，已在 Tailwind 中注册）
- 背景：`bg-background-light dark:bg-zinc-900`
- 文字主色：`text-text-main dark:text-zinc-100`
- 卡片：`bg-white dark:bg-zinc-800 rounded-2xl shadow-sm`
- 按钮激活：`active:scale-[0.97] transition-all`
- 骨架屏：`animate-pulse bg-gray-100 dark:bg-zinc-800`

### 页面结构模板
```tsx
return (
  <div className="pb-24 fade-in">
    <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
      {/* 返回 + 标题 */}
    </header>
    <main className="px-6 space-y-6">
      {/* 内容 */}
    </main>
    <BottomNav />
  </div>
);
```

### 返回按钮模板
```tsx
<button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all">
  <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
</button>
```

---

## 数据库变更规范

- 新表：`CREATE TABLE IF NOT EXISTS public.xxx`
- 索引：`CREATE INDEX IF NOT EXISTS idx_xxx`
- 必须启用 RLS：`ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY`
- Policy 命名：`"英文描述"` 格式
- 迁移文件：`supabase/migrations/add_xxx.sql`，文件名语义化

---

## 禁止事项

- 禁止在组件中直接 import supabase 客户端
- 禁止使用 `any` 类型（必须明确类型或用 `unknown` + 类型守卫）
- 禁止内联 style（除非动态计算且无法用 Tailwind 实现）
- 禁止使用 `console.log`（调试完请清理）
- 禁止在同一 PR 中修改与当前 Phase 无关的文件

---

## 阶段开发顺序

每个新功能按以下顺序实现：
1. `supabase/migrations/*.sql`（数据库变更）
2. `types.ts`（类型定义）
3. `lib/api/*.ts`（数据访问层）
4. `pages/*.tsx`（页面组件）
5. `App.tsx`（路由注册）
6. `pages/Home.tsx`（首页入口，如需要）
7. `npm run build` 验证无错误

---

## 当前实现进度

参见 [docs/demand/petconnect-innovation/00-overview.md](../docs/demand/petconnect-innovation/00-overview.md)
