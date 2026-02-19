---
name: readme-deployment
description: 专业处理 README 与部署文档。Use when writing README, deployment guides, environment variable docs, or project structure documentation. 约定：README 必须包含环境变量表、获取 API Key 的链接、部署步骤、项目结构。
---

# README 与部署文档规范

## README 必备章节

1. **项目简介**：一句话说明 + 技术栈表
2. **项目结构**：目录树，说明核心文件职责
3. **本地开发**：`npm install`、`npm run dev`、访问地址
4. **环境变量**：表格形式，含变量名、说明、获取链接
5. **数据库/后端初始化**：建表、种子数据、认证配置
6. **部署**：Vercel/Netlify 步骤，含环境变量配置
7. **项目瘦身**：`.gitignore` 要点、不提交内容

## 环境变量表格式

```markdown
| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `VITE_SUPABASE_URL` | 项目 URL | [Supabase](https://supabase.com/dashboard/project/_/settings/api) → Project URL |
| `VITE_SUPABASE_ANON_KEY` | 匿名公钥 | 同上 → anon public |
```

必须提供可点击的获取链接，不要只写「在控制台获取」。

## 部署步骤格式

- 构建命令、输出目录
- 环境变量在平台中的配置路径
- SPA 需说明路由重写（如 vercel.json）

## 项目瘦身要点

- `node_modules`、`dist`、`.env.local` 必须忽略
- 说明避免提交大文件、构建产物
