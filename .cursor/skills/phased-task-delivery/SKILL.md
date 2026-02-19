---
name: phased-task-delivery
description: 将大型需求拆分为多阶段任务文档并分步交付。当用户说「拆分任务」「分阶段执行」「按需求文档实现」「分部交付」，或提供分析报告要求逐步实现时使用。自动在 docs/demand/<主题>/ 下建立 phases/ 目录，生成带状态标注的阶段文档，每阶段完成后更新状态、提供后续步骤，并询问是否 push。
---

# Phased Task Delivery — 分阶段任务交付

## 触发场景

- 用户提供需求文档/分析报告，要求「拆分任务」「分部执行」
- 功能模块多（3个以上），需跨 session 持续推进
- 希望每个阶段独立可交付、下一个 agent 能顺利接手

---

## 目录规范

```
docs/demand/
└── <主题名>/               # 每个主题一个文件夹（kebab-case）
    ├── 00-overview.md      # 总览与阶段索引（必须第一个创建）
    ├── 00-foundation.md    # 前置基础（如有）
    ├── phase-1-xxx.md
    ├── phase-2-xxx.md
    └── phase-N-xxx.md
```

> 主题名示例：`blog-system`、`auth-module`、`dashboard-v2`

---

## 执行流程

### Step 1：读取需求，规划阶段

阅读用户提供的文档，按以下原则划分阶段：
- 每阶段 **独立可交付**（有明确验收标准）
- 相互**有依赖的放后面**，并发无依赖的可合并
- 单阶段工时建议 **15–50h**，过大拆分

在回复中先输出阶段规划（文字形式），等用户确认后再生成文档。

### Step 2：创建目录和文档

```bash
# 目录结构示例
docs/demand/<主题>/
```

**每份文档的统一模板**（见 [reference.md](reference.md#文档模板)）：

```markdown
# Phase N：<标题>

> **状态**：⬜ 待执行
> **预计工时**：Xh
> **前置条件**：[Phase N-1](./phase-N-1.md) 完成
> **目标**：一句话描述

## 核心交付物
## 新增依赖
## 数据库变更（如有）
## 新增/修改文件清单
## 核心实现（关键代码片段）
## 验收标准
- [ ] 可测试的验收条目
```

### Step 3：执行阶段

每次执行一个阶段：

1. 开始前将文档状态改为 `🔄 执行中`
2. 按文档清单实现代码
3. 运行类型检查 / 构建验证
4. 完成后将文档状态改为 `✅ 已完成`，填写实际完成时间

**状态标注位置**（文档第2行）：

| 状态值 | 含义 |
|--------|------|
| `⬜ 待执行` | 尚未开始 |
| `🔄 执行中` | 当前 session 正在做 |
| `✅ 已完成` | 验收通过 |
| `⏸ 暂停` | 外部依赖阻塞（如等待 API Key） |

### Step 4：阶段完成后固定输出

每个阶段执行完成后，**必须**按以下格式输出：

```
## 本阶段交付总结

| 文件/操作 | 状态 |
|-----------|------|
| src/xxx   | ✅   |
| ...       | ...  |

## 验证结果
- TypeScript: ✅ 零报错
- Build: ✅ 成功

## 后续步骤（下一个 Agent 请从这里接手）

**当前状态**：Phase N 已完成，Phase N+1 待执行

**下一步**：
1. 阅读 [phase-N+1 文档](../phases/phase-N+1.md)
2. 确认前置条件满足（列出具体条件）
3. 执行 Phase N+1

**需要用户操作**（如有）：
- [ ] 在 Supabase 控制台执行 DDL（参见 phase-1 第X节）
- [ ] 配置 .env.local（复制 .env.example）

---
是否将本次变更 push 到远端？（y/n）
```

---

## 最终阶段完成后

所有阶段完成后额外输出：

```
## 🎉 项目交付完成

### 总交付物
- N 个阶段，共 X 个文件
- 验收覆盖：XX 条通过

### 建议后续操作
1. 在 Supabase 控制台补全环境配置
2. 运行 `npm run build` 最终验证
3. 部署：参见 .cursor/skills/deploy/SKILL.md

是否将所有变更 push 到远端？
```

---

## 衔接规范（跨 session 交接）

在 `00-overview.md` 末尾维护一个「当前进度」区块，每次更新：

```markdown
## 📍 当前进度（Agent 接手请读此处）

- **最后更新**：2026-02-19
- **已完成**：Foundation、Phase 1
- **进行中**：Phase 2（src/components/article/ 实现到一半）
- **待执行**：Phase 3 ~ Phase 6

**下一步**：打开 [phase-2-interaction.md](./phase-2-interaction.md)
从「CommentSection 组件」处继续。
```

---

## 参考

- 完整文档模板与示例见 [reference.md](reference.md)
- git push 流程见 [../github-batch-commits/SKILL.md](../github-batch-commits/SKILL.md)
