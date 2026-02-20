# Phase 2：AI 领养匹配评分

> **状态**：⬜ 待执行
> **预计工时**：24h
> **前置条件**：[Phase 1](./phase-1-lost-alert-mvp.md) 完成
> **目标**：为领养申请生成结构化匹配评分与风险提示，辅助决策

## 核心交付物

- 领养匹配问卷（居住环境、作息、预算、过敏史、经验等）。
- AI 评分结果（总分 + 维度分 + 原因解释 + 风险提示）。
- 匹配报告卡片展示在申请流程与宠物详情中。

## 新增依赖

- 无（复用现有 `lib/api/llm.ts` 与 provider 切换机制）。

## 数据库变更

- 新增迁移：`supabase/migrations/add_adoption_match_scores.sql`
- 新表：`public.adoption_match_scores`
  - 字段：`id`, `user_id`, `pet_id`, `application_id`, `overall_score`, `stability_score`, `time_score`, `cost_score`, `experience_score`, `allergy_risk_level`, `summary`, `risk_notes`, `suggestions`, `raw_payload`, `created_at`
- RLS：仅本人可读写，送养方可读与其宠物关联的评分摘要。

## 新增/修改文件清单

- 新增 `lib/api/adoptionMatch.ts`
- 修改 `lib/api/llm.ts`（增加匹配评分生成方法）
- 修改 `pages/AdoptionForm.tsx`
- 修改 `pages/PetDetail.tsx`
- 修改 `types.ts`

## 核心实现（关键点）

- Prompt 输出约束为 JSON 结构，避免自由文本不可控。
- 增加 anti-abuse 规则：输入过短/灌水时直接拒绝评分。
- 前端展示“建议参考，不替代人工判断”。

## 验收标准

- [ ] 申请页可完成问卷并生成评分。
- [ ] 评分包含总分、4 个维度分、风险项、建议。
- [ ] 可重复生成且历史可追溯。
- [ ] 不满足输入质量时有明确提示。
- [ ] `npm run build` 通过。

## 风险与回滚

- 模型响应不稳定时，先降级为规则引擎（非 AI）。
- 成本超预算时，增加缓存与最小调用间隔。
