# PetConnect 生态模块并行开发 — Agent 认领提示词

> **用途**：在新对话窗口中，让 Agent 认领一个生态并开始开发，确保不与其他窗口冲突。
> **使用方式**：复制本文到新对话，将「你认领的生态」一节替换为具体生态编号与名称。

---

## 项目背景

- **项目**：PetConnect 宠物平台（React + TypeScript + Supabase）
- **规范**：`.ai/rules/`、`docs/WORKFLOW.md`、`docs/QUICK_REFERENCE.md`
- **任务索引**：`tasks/_ecosystem-parallel-index.md`
- **边界规则**：`docs/prompts/ecosystem-boundary-rules.md`

---

## 认领流程

1. 打开 `tasks/_ecosystem-parallel-index.md`，查看各生态的认领状态
2. 选择状态为「⬜ 待认领」的生态，将状态改为「🚧 进行中」，并注明「Agent-{你的标识}」（如 Agent-A、Agent-B）
3. 进入该生态的 `tasks/ecosystem-N-xxx/spec.md`，阅读目标与验收标准
4. 按 spec 中的「专属文件范围」进行开发，**禁止修改其他生态的专属文件**
5. 遵守 `docs/prompts/ecosystem-boundary-rules.md` 中的共享文件修改规则

---

## 你认领的生态

**生态编号**：N（请替换为 1~7）

**生态名称**：xxx（请替换为具体名称）

**专属目录**：
- `lib/api/xxx.ts`
- `pages/Xxx.tsx`
- `components/Xxx.tsx`（如有）

**共享资源**：仅可读取/扩展，不可删除其他模块逻辑

---

## 各生态快速对照

| 编号 | 名称 | spec 路径 |
|:---:|---|-----------|
| 1 | 社区宠物达人体系 | `tasks/ecosystem-1-community-experts/spec.md` |
| 2 | 宠物险与健康保障中心 | `tasks/ecosystem-2-pet-insurance/spec.md` |
| 3 | 线下门店体验中心 | `tasks/ecosystem-3-offline-stores/spec.md` |
| 4 | 宠物社群与城市挑战赛 | `tasks/ecosystem-4-pet-challenges/spec.md` |
| 5 | 宠物电商与积分商城升级 | `tasks/ecosystem-5-ecommerce-upgrade/spec.md` |
| 6 | AI 宠物健康顾问升级 | `tasks/ecosystem-6-ai-health-advisor/spec.md` |
| 7 | 宠物遗传基因库与繁育系统 | `tasks/ecosystem-7-genetics-breeding/spec.md` |

---

## 下一步

请阅读 `tasks/ecosystem-N-xxx/spec.md`，制定执行计划并开始实现。完成时在 `tasks/_ecosystem-parallel-index.md` 中标记「✅ 已完成」。
