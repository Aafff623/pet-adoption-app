# Phase 6：PWA 离线救助包

> **状态**：✅ 已完成
> **预计工时**：16h
> **前置条件**：[Phase 5](./phase-5-ai-health-diary.md) 完成
> **目标**：在弱网/离线场景下提供关键救助信息可读与回传能力

## 核心交付物

- 离线可读：最近浏览的警报、任务、宠物档案。
- 离线草稿：线索提交与任务反馈先本地暂存，联网后同步。
- 离线提示：网络状态 banner + 同步状态反馈。

## 新增依赖

- 可选：`idb-keyval`（若当前本地存储能力不足）。

## 数据库变更

- 无强制新增表。
- 可选新增：`sync_events`（记录离线回传日志，后续追踪）。

## 新增/修改文件清单

- 新增 `lib/offline/cache.ts`
- 新增 `lib/offline/syncQueue.ts`
- 修改 `vite.config.ts`（PWA runtimeCaching 强化）
- 修改 `pages/LostAlerts.tsx` / `pages/RescueBoard.tsx`（离线兜底读取）

## 核心实现（关键点）

- 缓存策略：API 请求采用 stale-while-revalidate。
- 队列策略：离线写请求排队，恢复网络后按 FIFO 重放。
- 冲突处理：若服务端记录已关闭/失效，提示用户手动确认。

## 验收标准

- [ ] 断网可打开最近访问的关键页面。
- [ ] 离线提交动作可排队并在联网后同步成功。
- [ ] 同步失败有可见提示与重试入口。
- [ ] `npm run build` 通过。

## 风险与回滚

- 若 service worker 缓存冲突，先下调缓存范围，仅保留核心页面与 API。
