# Spec：AI 宠物健康顾问升级

> **生态编号**：6
> **状态**：🚧 进行中（Agent-6 认领）
> **预计工时**：35h
> **核心价值**：从被动日记分析→主动诊断预警，提高用户信任

---

## Goal

升级 AI 宠物健康顾问，实现异常预警、多轮对话智能体、居家护理指南、紧急医院转诊匹配。

---

## 功能清单

- 异常预警系统（基于健康日记生成预警）
- 多轮对话的智能体（「它最近为什么频繁挠耳朵？」）
- 居家护理指南生成
- 紧急情况快速匹配医院转诊
- 数据驱动：积累的日记数据训练专有 AI 模型
- 变现：增值咨询费、医院转诊佣金

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/healthAdvisor.ts` |
| 页面 | `pages/HealthAdvisorChat.tsx`、`pages/HealthAlerts.tsx` |
| 配置 | `lib/config/aiAgents.ts`（扩展，仅追加） |

---

## 共享资源（只读/只增）

- `lib/api/healthDiary.ts`：读取健康日记
- `lib/api/healthInsights.ts`：读取 AI 分析结果
- `lib/api/llm.ts`：统一 LLM 调用
- 不修改 healthDiary 表结构、RLS

---

## 数据库变更

- `health_alerts`：异常预警记录
- `health_consultation_logs`：咨询对话日志
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-6-health-advisor.sql`

---

## API/DB Touch

- 新增：`lib/api/healthAdvisor.ts`（预警生成、多轮对话、护理指南、转诊匹配）
- 扩展：`lib/config/aiAgents.ts`（追加 health_advisor 等 Agent，不删除已有）
- 只读：`lib/api/healthDiary.ts`、`lib/api/healthInsights.ts`、`lib/api/llm.ts`

---

## 验收标准

- [x] 基于健康日记生成异常预警
- [x] 多轮对话智能体可回答健康问题
- [x] 可生成居家护理指南（API 已实现，Chat 可调用）
- [x] 紧急情况可匹配医院转诊（MVP 已简化）
- [x] `npm run build` 通过
- [x] 未修改 healthDiary、healthInsights 核心逻辑

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
