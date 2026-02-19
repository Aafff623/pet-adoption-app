---
name: repo-slimming
description: 项目仓库瘦身与规范。Use when cleaning repo, optimizing .gitignore, removing large files, or organizing project structure. 约定：脚本仅用 PowerShell / npm 跨平台命令，不生成 .sh 文件。
---

# 项目瘦身规范

## .gitignore 必备

```
node_modules
dist
dist-ssr
*.local
.env.local
.env.*.local
```

## 避免提交

- 构建产物（`dist`、`build`、`.next`、`out`）
- 依赖目录（`node_modules`）
- 环境变量文件（`.env.local`、`.env.production.local`）
- 大文件、日志、临时文件

## 脚本规范（Windows）

- 不生成 `.sh` 文件
- 使用 `rimraf`、`cross-env` 等跨平台 npm 包
- 如需脚本，使用 `.ps1` 或 npm scripts
