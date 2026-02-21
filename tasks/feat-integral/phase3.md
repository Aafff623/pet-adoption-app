# Phase 3：任务成长与社区共创

## 目标
围绕“积分成长”打造社区任务书+公益联动，让积分在照顾宠物、志愿服务、捐赠之间流转。

## 状态
- [x] 已完成

## 技术拆分
1. **任务进度与等级**
   - 在 `lib/api/points.ts` 或新文件中加入任务状态查询，如 `fetchPointTasks` API，供 `PointsTasks` 显示任务完成率。
   - 为积分设置等级与成长指标（铜/银/金），在 `pages/Profile.tsx` 展示当前等级与可达成目标。
2. **社群与公益**
   - 增加“积分捐赠”按钮（例如 `pages/PointsTasks` 中），调用新的 RPC 如 `donate_points` 或在客户端直接写 `points_transactions`；可参考 `supabase/migrations/add_points_donations.sql`。
   - 在 `docs/enterprise/points-partners.md` 记录合作机构与福利说明。
3. **运营内容**
   - 推出周期性“积分翻倍日”与“成长任务挑战”，在 `Home.tsx` 及 `components/NetworkBanner.tsx` 加入口提示，使用 `useToast` 通知。
   - 准备“积分榜”可视化，在 `pages/PointsRank.tsx` 展示 Top N 用户（可先用静态数据）。
4. **测试与监控**
   - 记录 `points_transactions` 流水用于后台对账；新增 `lib/utils/metrics.ts` 统计兑换/任务事件。