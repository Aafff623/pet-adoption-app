# Dark Mode Design 详细参考

## 一、暗色色板完整表（Tailwind zinc）

| 用途 | 类名 | 色值 |
|------|------|------|
| 页面背景 | `zinc-900` | #18181b |
| 卡片/表面 | `zinc-800` | #27272a |
| 次级表面 | `zinc-700` | #3f3f46 |
| 边框/分割线 | `zinc-700` / `zinc-600` | #3f3f46 / #52525b |
| 次要文字 | `zinc-500` / `zinc-400` | #71717a / #a1a1aa |
| 主文字 | `zinc-100` / `zinc-200` | #f4f4f5 / #e4e4e7 |

---

## 二、特殊元素处理

### 占位图

- SVG 占位图中 `fill='%23f3f4f6'` 在暗色下可改为 `%2327272a`
- 或使用 `currentColor` 通过 CSS 控制，随主题变化

### 轮播/卡片上的渐变

- `from-black/80 via-black/20 to-transparent` 在暗色下可保持
- 或微调透明度以适配暗色背景

### primary 按钮

- 保持 `bg-primary text-black`，确保对比度
- 暗色下 primary 色块上的文字用深色（zinc-900 或 black）

### Toast

- 浅色：`bg-gray-800`
- 暗色：`bg-zinc-600` 或 `bg-zinc-700`，与背景区分

### 错误/警告等语义色

- `bg-red-50` → `dark:bg-red-900/20` 或 `dark:bg-red-900/30`
- `bg-orange-50` → `dark:bg-orange-900/30`
- `border-red-200` → `dark:border-red-800`

---

## 三、实现架构

```
ThemeProvider
  ├── prefers-color-scheme (系统偏好)
  ├── localStorage (用户偏好: light | dark | system)
  └── html.dark / html.light
        └── Tailwind dark: 变体
```

- **ThemeContext**：状态 `'light' | 'dark' | 'system'`
- **resolvedTheme**：`theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme`
- **持久化**：`localStorage.setItem('petconnect_theme', theme)`
- **监听**：`matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`

---

## 四、WCAG 对比度要求

- **正文**：对比度至少 4.5:1
- **大号文字**（18px+ 或 14px+ 粗体）：至少 3:1
- 避免高饱和色直接作为正文背景上的文字色

---

## 五、NN/G 与行业实践要点

- 用户期望暗色模式在系统级生效，应用应默认跟随系统
- 暗色模式对部分视障用户（如白内障）有助益，但并非对所有人更好
- 阴影在暗色下效果弱，用边框和背景色差表现层级
- 细灰分割线在深色背景上易消失，需提高对比度
