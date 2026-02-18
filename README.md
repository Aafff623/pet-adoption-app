# PetConnect

宠物领养平台，连接爱心人士与待领养宠物。

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)

## 功能特性

- **浏览与筛选宠物**：按分类（狗/猫/兔/鸟等）、城市筛选待领养宠物
- **收藏与领养申请**：收藏心仪宠物，提交领养申请（姓名、年龄、职业、住房、养宠经验等）
- **私信沟通**：与送养人通过消息功能沟通
- **用户资料与实名认证**：完善个人资料，支持实名认证
- **意见反馈**：提交应用使用反馈

## 技术栈

| 类别       | 技术                                      |
| ---------- | ----------------------------------------- |
| 前端       | React 19 + TypeScript + Vite 6            |
| 路由       | React Router 7 (HashRouter)                |
| 样式       | Tailwind CSS (CDN) + Material Icons        |
| 后端/数据库 | Supabase (Auth + PostgreSQL + Storage)    |
| 可选       | Google Gemini API（AI 能力）              |

## 快速开始

**环境要求**：Node.js 18+

1. 克隆项目
2. 安装依赖：`npm install`
3. 复制 [`.env.local.example`](.env.local.example) 为 `.env.local`，配置：
   - `VITE_SUPABASE_URL`：Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY`：Supabase Anon Key
   - `GEMINI_API_KEY`：可选，用于 AI 能力
4. 在 Supabase SQL Editor 中依次执行 [`supabase/schema.sql`](supabase/schema.sql) 和 [`supabase/seed.sql`](supabase/seed.sql) 初始化数据库
5. 在 Supabase Storage 中创建 `avatars` 公开 Bucket（用于头像上传）
6. 启动开发服务器：`npm run dev`（默认端口 3000）

## 环境变量说明

| 变量                    | 说明                                      | 获取方式                                      |
| ----------------------- | ----------------------------------------- | --------------------------------------------- |
| `VITE_SUPABASE_URL`     | Supabase 项目 URL                         | Supabase Dashboard → Settings → API          |
| `VITE_SUPABASE_ANON_KEY`| Supabase 公开密钥                         | Supabase Dashboard → Settings → API          |
| `GEMINI_API_KEY`        | Google Gemini API 密钥（可选）            | [Google AI Studio](https://aistudio.google.com/apikey) |

详细说明见 [`.env.local.example`](.env.local.example)。

## 数据库初始化

1. 在 [Supabase Dashboard](https://supabase.com/dashboard) 进入项目 → SQL Editor
2. 先执行 `supabase/schema.sql`：创建表结构、RLS 策略、触发器
3. 再执行 `supabase/seed.sql`：插入示例数据（需已有 auth 用户，seed 中部分数据依赖用户 ID）

## 项目结构

```
petconnect-app/
├── components/       # 公共组件（如 BottomNav）
├── contexts/         # React Context（AuthContext）
├── lib/              # API 封装、Supabase 客户端
│   ├── api/          # pets, favorites, adoption, messages, feedback, verification
│   └── supabase.ts
├── pages/            # 页面组件
├── supabase/         # 数据库脚本
│   ├── schema.sql
│   └── seed.sql
├── App.tsx
├── types.ts
└── index.html
```

## 可用脚本

| 命令              | 说明           |
| ----------------- | -------------- |
| `npm run dev`     | 启动开发服务器 |
| `npm run build`   | 构建生产版本   |
| `npm run preview` | 预览构建结果   |

## 部署

本项目为静态前端应用，可部署至 Vercel、Netlify 等平台。构建命令为 `npm run build`，输出目录为 `dist/`。部署前需在平台中配置环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
