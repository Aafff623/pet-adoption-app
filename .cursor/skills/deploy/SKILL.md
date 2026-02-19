---
name: deploy
description: Guides Vercel deployment and PWA setup for petconnect-app. Use when deploying to Vercel, configuring PWA, adding to home screen, or troubleshooting deployment/auth/AI issues.
---

# Deploy 部署技能

**触发词**：部署、Vercel、PWA、发布、上线、vercel 部署、PWA 安装

---

## 一、Vercel 部署流程

### 1. 导入项目

1. 登录 [Vercel](https://vercel.com) → Add New → Project
2. 选择 GitHub 仓库（如 `pet-adoption-app`）
3. 确认分支 `main`

### 2. 构建配置

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Vite（自动检测） |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | `./` |

项目已有 [vercel.json](d:\OneDrive\Desktop\project\vibeCoding\petconnect-app\vercel.json)，可覆盖上述配置。

### 3. 环境变量（必填）

在 Vercel → Settings → Environment Variables 添加：

| Key | 必填 | 说明 |
|-----|:----:|------|
| `VITE_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 是 | Supabase Anon Key |
| `VITE_LLM_PROVIDER` | 否 | `deepseek` / `doubao` / `gemini`，默认 deepseek |
| `VITE_DOUBAO_API_KEY` | doubao 时 | 豆包 API Key |
| `VITE_DOUBAO_MODEL_ID` | doubao 时 | 豆包推理接入点 ID（ep-xxx 或预置模型 ID） |
| `VITE_DEEPSEEK_API_KEY` | deepseek 时 | DeepSeek API Key |
| `VITE_GEMINI_API_KEY` | gemini 时 | Gemini API Key |

**注意**：环境变量修改后必须 **Redeploy** 才能生效（Vite 在构建时注入）。

### 4. Supabase URL 配置

部署完成后，在 Supabase Dashboard → Authentication → URL Configuration：

- **Redirect URLs**：添加 `https://<你的项目>.vercel.app/`（如 `https://pet-adoption-app-omega.vercel.app/`）
- **Site URL**：可改为生产域名

否则登录/注册后重定向会失败。

---

## 二、PWA 流程

### 1. 依赖与配置

项目已集成 `vite-plugin-pwa`，[vite.config.ts](d:\OneDrive\Desktop\project\vibeCoding\petconnect-app\vite.config.ts) 中已配置 VitePWA 插件及 manifest。

### 2. 图标资源

图标位于 [public/pets/](d:\OneDrive\Desktop\project\vibeCoding\petconnect-app\public\pets)：

| 文件 | 用途 |
|------|------|
| `pwa-192x192.png` | Manifest 小图标 |
| `pwa-512x512.png` | Manifest 主图标 |
| `favicon.ico` | 浏览器标签页 |
| `apple-touch-icon.png` | iOS 主屏幕 |

### 3. 验证 PWA

1. 部署后访问 Vercel 域名
2. Chrome DevTools → Application → Manifest：检查名称、图标、theme_color
3. Application → Service Workers：确认已注册
4. 安卓：菜单 → 「添加到主屏幕」；桌面：地址栏安装图标

---

## 三、坑点速查

完整坑点见 [reference.md](reference.md)。

| 坑点 | 快速处理 |
|------|----------|
| 提交信息乱码 | 提交信息请使用英文；若已乱码，用 `git commit -F <文件>` 修正，见 [github-batch-commits](../github-batch-commits/SKILL.md) |
| AI 回复失败 | 配置 VITE_LLM_* 环境变量并 Redeploy |
| 注册成功登录失败 | Supabase 邮箱未验证，查 auth.users.email_confirmed_at |
| 登录重定向失败 | Supabase Redirect URLs 添加 Vercel 域名 |
| 环境变量不生效 | 修改后必须 Redeploy |

---

## 四、检查清单

**部署前**：

- [ ] 环境变量已在 Vercel 配置（含 Supabase、LLM）
- [ ] Supabase Redirect URLs 已添加 Vercel 域名

**部署后**：

- [ ] 访问域名可正常打开
- [ ] 登录/注册流程正常
- [ ] AI 智能体（若配置）可正常回复
- [ ] PWA 可「添加到主屏幕」

**调试**：

- Supabase 数据：使用 [supabase-calls](../supabase-calls/SKILL.md) 的 `execute_sql` 查 auth.users、profiles
- AI 失败：浏览器控制台查看 `[PetConnect Doubao]` 日志
