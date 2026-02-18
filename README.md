<div align="center">

# 🐾 PetConnect

**连接每一颗爱心，为每一只宠物找到温暖的家**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CDN-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[功能特性](#-功能特性) · [技术栈](#-技术栈) · [快速开始](#-快速开始) · [项目结构](#-项目结构) · [部署](#-部署)

</div>

---

## 简介

PetConnect 是一款基于 Web 的宠物领养平台，旨在通过数字化手段打通送养人与领养人之间的信息壁垒。用户可以浏览待领养宠物、提交领养申请、与送养人实时沟通，平台同时提供实名认证、收藏管理等完整闭环功能。

---

## ✨ 功能特性

| 功能模块 | 描述 |
| --- | --- |
| 🔍 **浏览 & 筛选** | 按宠物类型（狗 / 猫 / 兔 / 鸟等）、所在城市多维度筛选 |
| ❤️ **收藏管理** | 一键收藏心仪宠物，随时查看收藏列表 |
| 📋 **领养申请** | 填写姓名、年龄、职业、住房情况、养宠经验等，提交正式申请 |
| 💬 **私信沟通** | 与送养人实时私信，支持消息记录持久化 |
| 🏠 **我的宠物** | 管理自己发布的宠物信息 |
| 👤 **个人资料** | 完善头像、昵称、联系方式等个人信息 |
| 🔐 **实名认证** | 提交真实身份信息，提升平台可信度 |
| 🌙 **主题设置** | 支持明 / 暗主题切换 |
| 📣 **意见反馈** | 一键提交应用体验反馈 |

---

## 🛠 技术栈

| 层级 | 技术选型 |
| --- | --- |
| **前端框架** | React 19 + TypeScript 5.8 |
| **构建工具** | Vite 6 |
| **路由** | React Router 7（HashRouter） |
| **样式** | Tailwind CSS（CDN）+ Material Icons |
| **后端 / 数据库** | Supabase（Auth + PostgreSQL + Storage） |
| **AI 能力（可选）** | Google Gemini API |

---

## 🚀 快速开始

### 前置要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- 一个 [Supabase](https://supabase.com) 项目

### 安装步骤

**1. 克隆仓库**

```bash
git clone https://github.com/your-username/petconnect-app.git
cd petconnect-app
```

**2. 安装依赖**

```bash
npm install
```

**3. 配置环境变量**

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key   # 可选，AI 智能体功能
```

> 详细说明见 [环境变量](#-环境变量) 章节。

**4. 初始化数据库**

在 [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor 中依次执行：

```sql
-- 第一步：创建表结构、RLS 策略、触发器
\i supabase/schema.sql

-- 第二步：插入示例数据（需要先有 auth 用户）
\i supabase/seed.sql
```

**5. 配置 Storage Bucket**

1. 进入 Supabase Dashboard → Storage → Buckets
2. 新建名为 `avatars` 的 **Public Bucket**
3. 在 SQL Editor 中执行 `supabase/storage_policies.sql` 配置上传策略

**6. 启动开发服务器**

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔑 环境变量

| 变量名 | 必填 | 说明 | 获取方式 |
| --- | :---: | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | Supabase 项目 URL | Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase 公开密钥 | Dashboard → Settings → API |
| `VITE_LLM_PROVIDER` | ❌ | AI 模型：`deepseek` / `doubao` / `gemini`，默认 `deepseek` | - |
| `VITE_DEEPSEEK_API_KEY` | deepseek 时 | DeepSeek API 密钥 | [platform.deepseek.com](https://platform.deepseek.com) |
| `VITE_DOUBAO_API_KEY` | doubao 时 | 豆包 API 密钥 | [火山方舟控制台](https://console.volcengine.com/ark) |
| `VITE_DOUBAO_MODEL_ID` | doubao 时 | 豆包模型 endpoint ID | 方舟控制台部署后获取 |
| `VITE_GEMINI_API_KEY` | gemini 时 | Google Gemini API 密钥 | [Google AI Studio](https://aistudio.google.com/apikey) |

完整示例见 [`.env.local.example`](.env.local.example)。

---

## 📁 项目结构

```
petconnect-app/
├── components/              # 公共 UI 组件（BottomNav 等）
├── contexts/                # React Context
│   └── AuthContext.tsx      # 全局认证状态
├── lib/                     # 业务逻辑层
│   ├── api/                 # 模块化 API 封装
│   │   ├── pets.ts          # 宠物相关
│   │   ├── favorites.ts     # 收藏相关
│   │   ├── adoption.ts      # 领养申请
│   │   ├── messages.ts      # 消息私信
│   │   ├── feedback.ts      # 意见反馈
│   │   └── verification.ts  # 实名认证
│   └── supabase.ts          # Supabase 客户端初始化
├── pages/                   # 页面级组件
│   ├── Home.tsx             # 首页（宠物列表 + 筛选）
│   ├── PetDetail.tsx        # 宠物详情
│   ├── AdoptionForm.tsx     # 领养申请表单
│   ├── Favorites.tsx        # 收藏列表
│   ├── Messages.tsx         # 消息列表
│   ├── ChatDetail.tsx       # 私信对话
│   ├── Profile.tsx          # 个人资料
│   ├── Verification.tsx     # 实名认证
│   ├── Settings.tsx         # 设置中心
│   └── ...                  # 其他功能页
├── supabase/                # 数据库脚本
│   ├── schema.sql           # 表结构 + RLS 策略 + 触发器
│   ├── seed.sql             # 示例数据
│   └── storage_policies.sql # Storage 上传权限策略
├── types.ts                 # 全局 TypeScript 类型定义
├── App.tsx                  # 根组件 + 路由配置
└── index.html               # HTML 入口
```

---

## 📦 可用脚本

```bash
npm run dev      # 启动本地开发服务器（端口 3000）
npm run build    # 构建生产版本，输出至 dist/
npm run preview  # 在本地预览生产构建结果
```

---

## 🌐 部署

PetConnect 是纯静态前端应用，可一键部署到任意静态托管平台。

### Vercel / Netlify（推荐）

1. 将仓库连接到 Vercel 或 Netlify
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 在平台的环境变量面板中配置：
   - `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（必填）
   - AI 智能体相关：`VITE_LLM_PROVIDER` 及对应 provider 的 API Key（见上方环境变量表），否则 AI 回复会显示「抱歉，我这边有点卡，稍后再试～」

> ⚠️ 注意：以 `VITE_` 为前缀的变量会被 Vite 在构建时注入到客户端代码中，请勿在此前缀下存放敏感密钥。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在提交 PR 前，请确保：

1. 代码通过 TypeScript 类型检查（`tsc --noEmit`）
2. 功能逻辑清晰，必要时补充注释
3. PR 描述清楚变更目的和测试方式

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。
