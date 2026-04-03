# GitHub 仓库总览 — Aafff623

> 生成时间：2026-04-03

## 账号信息

| 字段 | 内容 |
|------|------|
| GitHub 用户名 | [Aafff623](https://github.com/Aafff623) |
| 公开仓库数量 | 5 |
| 仓库主页 | https://github.com/Aafff623?tab=repositories |

---

## 仓库列表

### 1. 🐾 [pet-adoption-app](https://github.com/Aafff623/pet-adoption-app)

| 字段 | 内容 |
|------|------|
| 描述 | 使用 vibe coding 制作宠物领养的 app |
| 主语言 | TypeScript |
| 默认分支 | main |
| 创建时间 | 2026-02-18 |
| 最近更新 | 2026-02-22 |
| 可见性 | 公开 |

**项目概述**：PetConnect 是一款基于 Web 的智能宠物平台 PWA，技术栈为 React 19 + TypeScript + Vite + Tailwind CSS + Supabase。功能涵盖领养主链路、失踪宠物广播、AI 匹配评分、健康日记、积分商城、宠物保险、社区专家、线下门店预约等模块，详见本仓库 [README](../README.md)。

**已实现页面（~90 个路由）**：Home、Login、Profile、PetDetail、AdoptionForm、AdoptionProgress、LostAlerts、RescueBoard、Points、InsuranceCenter、Messages、ExpertList、StoreList、HealthAdvisorChat 等。

**数据库迁移文件**：35+ 个 SQL 迁移，覆盖宠物表、领养申请、里程碑、失踪广播、救助任务、AI 匹配得分、健康日记、积分体系、保险、门店等。

---

### 2. 🎮 [2Dgame-demo](https://github.com/Aafff623/2Dgame-demo)

| 字段 | 内容 |
|------|------|
| 描述 | vibe coding 一个 2D 的小游戏 |
| 主语言 | JavaScript |
| 默认分支 | main |
| 创建时间 | 2026-03-27 |
| 最近更新 | 2026-03-27 |
| 可见性 | 公开 |

---

### 3. 🖼️ [my-picture](https://github.com/Aafff623/my-picture)

| 字段 | 内容 |
|------|------|
| 描述 | 云图库 |
| 主语言 | Java |
| 默认分支 | main |
| 创建时间 | 2026-03-07 |
| 最近更新 | 2026-03-08 |
| 可见性 | 公开 |

---

### 4. 🤖 [minimax-api](https://github.com/Aafff623/minimax-api)

| 字段 | 内容 |
|------|------|
| 描述 | 开发一个基于 minimax 的多模态能力：图片、音频、对话、语音的 web 桌面平台程序 |
| 主语言 | Vue |
| 默认分支 | main |
| 创建时间 | 2026-03-26 |
| 最近更新 | 2026-03-27 |
| 可见性 | 公开 |

---

### 5. 🐍 [hello-github](https://github.com/Aafff623/hello-github)

| 字段 | 内容 |
|------|------|
| 描述 | 仅模拟测试 GitHub & Git 的基本交互功能以及笔记总结 demo |
| 主语言 | Python |
| 默认分支 | main |
| 创建时间 | 2026-03-04 |
| 最近更新 | 2026-03-06 |
| 可见性 | 公开 |

---

## 当前仓库（pet-adoption-app）快速导航

| 目录/文件 | 说明 |
|-----------|------|
| `pages/` | 页面组件（~90 个 .tsx 文件） |
| `components/` | 可复用 UI 组件 |
| `lib/api/` | Supabase 数据访问层 |
| `lib/utils/` | 工具函数 |
| `contexts/` | React Context（Auth / Theme / Toast） |
| `supabase/migrations/` | 数据库迁移 SQL |
| `docs/` | 项目文档与开发需求 |
| `tasks/` | AI 任务拆分与进度管理 |
| `types.ts` | 全局 TypeScript 类型定义 |
| `App.tsx` | 路由注册入口 |

## 建议的下一步

1. **部署**：配置 `.env.local`（参考 `.env.local.example`）并执行 `npm run build`，部署到 Vercel/Netlify。
2. **数据库初始化**：在 Supabase 项目中依次执行 `supabase/schema.sql` → `supabase/seed.sql` → `supabase/migrations/*.sql`。
3. **待开发功能**：参见 `docs/demand/` 目录中各创新功能规划文档。
4. **其他仓库**：`minimax-api` 和 `2Dgame-demo` 是近期最活跃的项目，可按需继续开发。
