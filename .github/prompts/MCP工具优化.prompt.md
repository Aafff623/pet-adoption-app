---
mode: agent
description: 根据当前任务场景，智能推荐应开启/关闭哪些 MCP 工具，避免超过 128 个工具导致降级
tools:
  - read
  - edit
  - vscode
---

# 🔧 MCP 工具集优化 Skill

## 触发条件

当用户说以下任意内容时激活此 Skill：
- "MCP 降级"
- "工具太多"
- "优化 MCP"
- "MCP 工具推荐"
- "我现在要做 xxx，帮我配置 MCP"
- "切换场景"

---

## 核心原则

> VS Code Copilot 超过 **128 个工具**时会触发降级，导致 AI 选错工具、遗漏参数或响应变慢。  
> **目标：根据当前任务场景，只保留必要工具，总数控制在 80 个以内。**

---

## 场景预设方案

### 🟢 场景 A：日常开发（写代码、改 Bug）

**推荐开启：**

| 工具 | 原因 |
|------|------|
| ✅ 内置：edit / read / search / execute / vscode / todo | 核心编辑能力，必须保留 |
| ✅ context7 | 查询最新库文档，写代码必备 |
| ✅ GitHub MCP | 查 Issue / PR，了解需求背景 |
| ✅ GitKraken MCP | Git 操作、提交、分支管理 |

**推荐关闭：**

| 工具 | 原因 |
|------|------|
| ❌ GitHub Copilot app modernization | Azure 部署工具，日常开发完全用不到（节省约 40+ 工具） |
| ❌ Firecrawl | 网页爬虫，写代码时不需要 |
| ❌ Brave Search | context7 已足够查文档 |
| ❌ Chrome DevTools MCP | 调试浏览器才需要，写代码阶段关闭 |
| ❌ Web To MCP | 调研阶段才需要 |

**预计工具数：~55 个** ✅

---

### 🟡 场景 B：调试 UI / 前端排查

**推荐开启：**

| 工具 | 原因 |
|------|------|
| ✅ 内置全部 | 必须 |
| ✅ Chrome DevTools MCP | 截图、DOM 查询、网络请求，前端调试核心 |
| ✅ context7 | 查 React / Tailwind 等框架 API |
| ✅ Firecrawl | 对比线上页面结构、抓取参考样式 |

**推荐关闭：**

| 工具 | 原因 |
|------|------|
| ❌ GitHub Copilot app modernization | 无关 |
| ❌ Brave Search | Firecrawl 已覆盖网页抓取 |
| ❌ GitHub MCP | 调试阶段不需要仓库管理 |
| ❌ GitKraken MCP | 调试阶段不需要 Git 操作 |

**预计工具数：~65 个** ✅

---

### 🔵 场景 C：资料调研 / 技术选型

**推荐开启：**

| 工具 | 原因 |
|------|------|
| ✅ 内置：read / search / web | 基础能力 |
| ✅ Brave Search | 实时搜索最新资讯 |
| ✅ Firecrawl | 深度爬取文章、文档页面 |
| ✅ context7 | 官方文档注入，避免幻觉 |
| ✅ Web To MCP | 访问特定在线资源 |

**推荐关闭：**

| 工具 | 原因 |
|------|------|
| ❌ GitHub Copilot app modernization | 无关 |
| ❌ Chrome DevTools MCP | 无关 |
| ❌ GitKraken MCP | 无关 |
| ❌ GitHub MCP | 调研时不需要操作仓库 |

**预计工具数：~50 个** ✅

---

### 🔴 场景 D：Azure 部署 / 云迁移

**推荐开启：**

| 工具 | 原因 |
|------|------|
| ✅ 内置全部 | 必须 |
| ✅ GitHub Copilot app modernization | 部署规划、IaC Bicep/Terraform 生成，此场景核心 |
| ✅ GitHub MCP | 仓库代码分析、CI/CD 配置 |

**推荐关闭：**

| 工具 | 原因 |
|------|------|
| ❌ Firecrawl | 无关 |
| ❌ Brave Search | 无关 |
| ❌ Chrome DevTools MCP | 无关 |
| ❌ context7 | 无关 |
| ❌ GitKraken MCP | GitHub MCP 已覆盖仓库操作 |

**预计工具数：~70 个** ✅

---

## 执行步骤

当用户触发此 Skill 时，按以下步骤处理：

### Step 1：确认场景

若用户未指定场景，先询问：

```
你当前的任务是？

A) 🟢 写代码 / 改 Bug（推荐 ~55 工具）
B) 🟡 调试前端 UI（推荐 ~65 工具）
C) 🔵 查资料 / 技术选型（推荐 ~50 工具）
D) 🔴 Azure 部署 / 云迁移（推荐 ~70 工具）
E) 自定义（告诉我你需要哪些能力）
```

### Step 2：给出开关清单

根据场景，输出：
- ✅ 应开启的工具列表（含原因）
- ❌ 应关闭的工具列表（含原因）
- 📊 预计工具总数

### Step 3：指导操作

提示用户在 VS Code 中执行：

```
方式一（推荐）：
Ctrl+Shift+P → 输入"选择工具" → 按清单勾选/取消

方式二：
点击 Copilot Chat 输入框左侧的 🔧 工具图标 → 逐项调整
```

### Step 4：确认结果

要求用户确认工具数已降至 128 以下，最优目标 80 以下。

---

## 工具数速查

| MCP 服务 | 大约工具数 |
|----------|----------|
| 内置（edit/read/search/execute/vscode/todo/web/agent） | ~20 |
| GitHub Copilot app modernization | ~45 |
| GitKraken MCP | ~15 |
| GitHub MCP | ~25 |
| Chrome DevTools MCP | ~20 |
| context7 | ~5 |
| Brave Search | ~3 |
| Firecrawl | ~8 |
| Web To MCP | ~5 |

> 开启全部 ≈ **146 个** → 超标  
> 按场景精选 ≈ **50~75 个** → 最优 ✅

---

## 快速触发模板

用户可直接粘贴使用：

```
#MCP工具优化 我现在要[写代码/调试UI/查资料/部署]，帮我推荐最精简的工具组合
```
