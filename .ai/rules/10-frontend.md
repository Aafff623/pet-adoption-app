# Frontend Rules

- 使用 React 函数组件与 Hooks，禁止类组件。
- TypeScript 严格模式，避免 `any`；必要时使用 `unknown` + 类型守卫。
- 样式使用 Tailwind 原子类，禁止内联 style（无法避免的动态计算除外）。
- 主题切换通过 `useTheme()` 与 `dark:` 前缀实现暗色适配。
- 图标统一使用 Material Icons Round：`<span className="material-icons-round">...</span>`。
- 路由使用 `react-router-dom` + Hash 路由。
- 页面结构遵循移动优先，主容器不超过 `max-w-md`。
- 返回逻辑统一：历史存在时 `navigate(-1)`，否则回首页替换跳转。
