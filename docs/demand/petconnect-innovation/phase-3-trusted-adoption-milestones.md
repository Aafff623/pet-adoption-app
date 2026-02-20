# Phase 3：可信领养流程里程碑

> **状态**：⬜ 待执行
> **预计工时**：18h
> **前置条件**：[Phase 2](./phase-2-ai-adoption-match.md) 完成
> **目标**：将领养过程标准化为可追踪里程碑，降低纠纷

## 核心交付物

- 流程节点：沟通中 -> 线下见面 -> 试养中 -> 正式领养。
- 节点确认：双方确认与时间戳留痕。
- 争议记录：每个节点可追加备注。

## 新增依赖

- 无。

## 数据库变更

- 新增迁移：`supabase/migrations/add_adoption_milestones.sql`
- 新表：`public.adoption_milestones`
  - 字段：`id`, `application_id`, `pet_id`, `adopter_id`, `owner_id`, `stage`, `status`, `confirmed_by_adopter`, `confirmed_by_owner`, `note`, `confirmed_at`, `created_at`, `updated_at`
  - 约束：`stage in ('chatting','meet','trial','adopted')`
- RLS：仅流程双方可读写。

## 新增/修改文件清单

- 新增 `lib/api/adoptionMilestones.ts`
- 修改 `pages/AdoptionProgress.tsx`
- 修改 `pages/ChatDetail.tsx`（挂接流程入口）
- 修改 `types.ts`

## 核心实现（关键点）

- 状态机约束：必须按顺序流转，禁止跳跃阶段。
- 双方确认机制：任一方撤销确认时回到待确认。
- 记录不可篡改字段：`confirmed_at` 只在首次确认时写入。

## 验收标准

- [ ] 流程节点可视化且顺序正确。
- [ ] 双方确认逻辑正确，状态实时更新。
- [ ] 可查看每节点历史备注与时间。
- [ ] `npm run build` 通过。

## 风险与回滚

- 若双边状态复杂度过高，先改为单方推进 + 系统提醒。
