---
name: readme-generator
description: Generates professional README files by synthesizing standard-readme, Best-README-Template, Google styleguide, and GitHub best practices. Use when creating or redesigning README.md, documenting projects, or when the user asks for README templates or best practices.
---

# README Generator

生成专业、规范的 README 文件，融合主流规范与个性化风格。

**触发词**：README、项目说明、文档设计、readme 规范、readme 模板

---

## 一、核心原则

1. **先分析项目**：阅读 `package.json`、目录结构、主要入口文件，理解技术栈与功能
2. **按规范顺序**：章节顺序遵循 [reference.md](reference.md) 中的主流规范
3. **语言与受众**：根据项目定位选择中文或英文；技术术语可保留英文
4. **无敏感信息**：不写真实 API Key、内部 URL、未公开配置

---

## 二、必选章节（按顺序）

| 顺序 | 章节 | 要求 |
|------|------|------|
| 1 | **Title** | 项目名，与仓库/包名一致；可加副标题 |
| 2 | **Short Description** | 一句话简介，≤120 字符，单独一行 |
| 3 | **Badges** | 技术栈徽章（shields.io），可选 License、Build 等 |
| 4 | **功能特性 / Features** | 核心功能列表或表格，简洁明了 |
| 5 | **技术栈 / Built With** | 框架、库、服务，表格或列表 |
| 6 | **快速开始 / Getting Started** | 前置要求、安装步骤、环境变量、启动命令 |
| 7 | **Usage / 使用说明** | 基本用法、示例命令或代码块 |
| 8 | **项目结构** | 目录树，标注关键文件用途 |
| 9 | **部署** | 静态/容器部署说明，环境变量提醒 |
| 10 | **Contributing** | 贡献方式、PR 要求、Issue 链接 |
| 11 | **License** | 许可证名称，链接到 LICENSE 文件 |

---

## 三、可选章节（按需插入）

- **Table of Contents**：README 超过 100 行时建议添加
- **Banner / 截图**：项目 Logo 或界面截图，置于标题后
- **Background / 项目背景**：动机、解决的问题、与同类项目的区别
- **Roadmap**：计划功能、已知问题
- **Contact / Maintainers**：维护者、联系方式
- **Acknowledgments**：致谢、参考资源

---

## 四、风格选择（个性化）

根据项目类型选择一种风格，并在生成时保持一致：

| 风格 | 适用 | 特点 |
|------|------|------|
| **简洁** | 库、工具、CLI | 少 emoji，纯文本，章节精简 |
| **专业** | 企业、开源项目 | 表格多，结构清晰，徽章齐全 |
| **创意** | 个人项目、作品集 | 适度 emoji、居中标题、视觉层次 |

**创意风格可选元素**：
- 居中标题：`<div align="center">...</div>`
- 章节前 emoji：`## ✨ 功能特性`、`## 🚀 快速开始`
- 快速导航：`[功能](#功能) · [开始](#开始)`
- 表格内 emoji 图标：`🔍 浏览`、`❤️ 收藏`

---

## 五、快速开始模板

```markdown
### 前置要求
- Node.js ≥ 18
- [其他依赖]

### 安装步骤
1. 克隆：`git clone <repo>`
2. 安装：`npm install`
3. 配置：复制 `.env.example` 为 `.env`，填写变量
4. 启动：`npm run dev`
```

环境变量用表格说明：变量名 | 必填 | 说明 | 获取方式。

---

## 六、检查清单

生成后自检：

- [ ] 无断链（相对路径正确）
- [ ] 代码块有语言标识（`bash`、`env` 等）
- [ ] 敏感信息已用占位符（`your-api-key`）
- [ ] 与 `package.json` 的 `description` 一致
- [ ] 文件大小 < 500 KiB（GitHub 截断线）

---

## 七、参考资源

- 主流规范与章节顺序：见 [reference.md](reference.md)
- 风格示例：见 [examples.md](examples.md)
- 徽章生成：https://shields.io
- 许可证选择：https://choosealicense.com
