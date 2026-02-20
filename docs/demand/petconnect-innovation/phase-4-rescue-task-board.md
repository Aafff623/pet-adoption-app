# Phase 4：救助协作任务板

> **状态**：✅ 已完成
> **预计工时**：20h
> **前置条件**：[Phase 3](./phase-3-trusted-adoption-milestones.md) 完成
> **目标**：把救助行动拆解成多人协作任务，提高执行效率

## 核心交付物

- 任务类型：喂养、送医、接送、临时寄养、物资采购。
- 任务卡片：时间窗、地点、责任人、状态。
- 认领机制：志愿者可接单，完成后打卡反馈。

## 新增依赖

- 无。

## 数据库变更

- 新增迁移：`supabase/migrations/add_rescue_tasks.sql`
- 新表：`public.rescue_tasks`
  - 字段：`id`, `creator_id`, `title`, `task_type`, `description`, `location_text`, `latitude`, `longitude`, `window_start`, `window_end`, `status`, `assignee_id`, `completed_note`, `completed_at`, `created_at`, `updated_at`
  - 约束：`status in ('open','claimed','completed','cancelled')`
- 索引：`status+window_start`, `assignee_id+status`
- RLS：
  - SELECT: 登录用户可读公开任务
  - INSERT: 创建者本人
  - UPDATE: 创建者与认领者按状态限定更新

## 新增/修改文件清单

- 新增 `lib/api/rescueTasks.ts`
- 新增 `pages/RescueBoard.tsx`
- 新增 `pages/RescueTaskDetail.tsx`
- 修改 `App.tsx`
- 修改 `Home.tsx`（增加入口）
- 修改 `types.ts`

## 核心实现（关键点）

- 防冲突：同一任务只能有一个有效认领人。
- 状态流转：open -> claimed -> completed/cancelled。
- 过期任务提示：超过时间窗自动标记提醒。

## 验收标准

- [ ] 用户可创建任务并被他人认领。
- [ ] 认领后可提交完成反馈。
- [ ] 任务状态与筛选正确。
- [ ] `npm run build` 通过。

## 风险与回滚

- 若任务争抢频繁，增加乐观锁或事务更新。
