---
name: dark-mode-design
description: Design and implementation guidelines for dark mode. Covers common pitfalls, color palette, Tailwind replacement patterns. Use when implementing dark mode, designing dark themes, or reviewing dark mode implementations.
---

# Dark Mode Design 暗色模式设计规范

**触发词**：暗色模式、dark mode、深色主题、暗色主题、主题切换、prefers-color-scheme

---

## 一、坑点速查

| 坑点 | 规避策略 |
|------|----------|
| 纯黑 (#000) + 纯白 (#fff) | 使用深灰背景 (#18181b, #27272a) 和浅灰文字 (#e4e4e7)，避免极端对比 |
| 阴影在暗色下失效 | 用边框 + 轻微提亮背景色表现层级，而非依赖 shadow |
| 高饱和色在暗底上刺眼 | 暗色模式下 primary 适当降饱和或提高明度 |
| 细灰分割线消失 | 使用 `border-zinc-700/600` 替代 `border-gray-100/200` |
| 模态遮罩不可见 | 暗色下用 `bg-black/60` 或 `bg-white/5`，保证与背景区分 |
| 浮层/卡片融入背景 | 卡片用 `bg-zinc-800` 等略浅于背景，形成层级 |
| 字重问题 | 避免过细字体；粗体在暗底上略减重或提高对比度 |
| 图片/图形白底暴露 | 占位图、图标优先用透明背景 (SVG/PNG) |
| 用户无选择权 | 默认跟随系统，并在设置中提供「浅色 / 深色 / 跟随系统」 |

---

## 二、配色规范

- **页面背景**：`#18181b` (zinc-900)
- **卡片/表面**：`#27272a` (zinc-800)
- **次级表面**：`#3f3f46` (zinc-700)
- **边框**：`#3f3f46` / `#52525b` (zinc-700/600)
- **主色文字**（primary 按钮上）：暗色下用 `text-zinc-900` 或 `text-black` 保持可读性
- **次要文字**：`#a1a1aa` (zinc-400)

**禁止**：纯黑 #000、纯白 #fff 作为大面积背景或文字。

---

## 三、Tailwind 替换模式

| 浅色类名 | 暗色变体 |
|----------|----------|
| `bg-white` | `dark:bg-zinc-800` |
| `bg-gray-50` | `dark:bg-zinc-900` |
| `bg-gray-100` | `dark:bg-zinc-800` |
| `text-gray-900` | `dark:text-zinc-100` |
| `text-gray-500` / `text-gray-400` | `dark:text-zinc-400` / `dark:text-zinc-500` |
| `border-gray-100` / `border-gray-200` | `dark:border-zinc-700` / `dark:border-zinc-600` |
| `bg-black/50`（遮罩） | `dark:bg-black/60` |
| `hover:bg-gray-50` | `dark:hover:bg-zinc-700` |

---

## 四、用户选择与防闪烁

- **用户选择**：提供浅色、深色、跟随系统；默认跟随 `prefers-color-scheme`
- **防闪烁**：在 `index.html` 的 `<head>` 最前面加入内联脚本，首帧渲染前根据 `localStorage` 和 `prefers-color-scheme` 设置 `html` 的 `dark` class

---

## 五、检查清单

**实现前**：
- [ ] Tailwind 配置 `darkMode: 'class'`
- [ ] 已定义 ThemeContext（light/dark/system）并持久化到 localStorage

**实现后**：
- [ ] 无纯黑纯白，对比度符合 WCAG AA（正文 4.5:1，大号 3:1）
- [ ] 卡片、分割线、遮罩在暗色下清晰可辨
- [ ] 首屏无主题闪烁
- [ ] 设置中可切换浅色 / 深色 / 跟随系统，刷新后保持

---

## 六、详细参考

- 完整色板与特殊元素处理，见 [reference.md](reference.md)
