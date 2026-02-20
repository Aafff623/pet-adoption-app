# Phase 5：宠物情绪与健康日记（AI）

> **状态**：⬜ 待执行
> **预计工时**：26h
> **前置条件**：[Phase 4](./phase-4-rescue-task-board.md) 完成
> **目标**：支持宠物健康日记记录，并提供 AI 趋势分析与提醒

## 核心交付物

- 日记增强：饮食、排泄、活力、睡眠、体重等结构化记录。
- AI 分析：最近 7 天/30 天趋势摘要与异常提醒。
- 风险提示：仅作建议，提示就医阈值。

## 新增依赖

- 无（复用现有 AI provider 体系）。

## 数据库变更

- 新增迁移：`supabase/migrations/add_pet_health_diary.sql`
- 新表：`public.pet_health_diary`
  - 字段：`id`, `pet_id`, `author_id`, `mood_level`, `appetite_level`, `energy_level`, `sleep_hours`, `weight_kg`, `symptoms`, `note`, `image_url`, `recorded_at`, `created_at`
- 新表：`public.pet_health_insights`
  - 字段：`id`, `pet_id`, `user_id`, `period_days`, `insight_summary`, `risk_level`, `signals`, `suggestions`, `raw_payload`, `created_at`
- RLS：仅宠物关联用户可读写。

## 新增/修改文件清单

- 新增 `lib/api/healthDiary.ts`
- 新增 `lib/api/healthInsights.ts`
- 修改 `pages/MyPets.tsx`（增加健康记录入口）
- 新增 `pages/PetHealthDiary.tsx`
- 修改 `types.ts`

## 核心实现（关键点）

- 指标标准化：将文本输入映射到可统计区间。
- AI 输出结构化 JSON，便于趋势可视化。
- 异常规则兜底：即使 AI 失败也可给出规则提示。

## 验收标准

- [ ] 用户可新增结构化健康日记。
- [ ] 可查看 7 天/30 天趋势。
- [ ] AI 分析失败时有降级提示，不影响主流程。
- [ ] `npm run build` 通过。

## 风险与回滚

- 若 AI 质量不稳定，先只上线结构化记录与规则提醒。
