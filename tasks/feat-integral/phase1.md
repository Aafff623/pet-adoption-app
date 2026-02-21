# Phase 1：积分基础与任务体系

## 目标
建立积分账户基础（`profiles.points` + `points_transactions`），为用户提供扣分/加分 API，并在任务页展示可领取的成长激励。

## 状态
- [x] 已完成

## 技术拆分
1. **数据库迁移**
   - `supabase/migrations/2026-02-21-add-points-mall.sql`：新增 `points` 字段、`points_transactions` 表与 `redeem_points` RPC。
   - `supabase/migrations/2026-02-22-add-award-points.sql`：新增 `grant_points` RPC 供任务系统调用。
2. **API 层**
   - `lib/api/profile.ts`：增加 `points` 字段映射。
   - `lib/api/points.ts`：封装 `redeemPoints` 与 `grantPoints` RPC 调用。
3. **页面/路由**
   - `pages/Points.tsx`：展示当前积分并跳转兑换。
   - `pages/PointsTasks.tsx`：成长任务书 UI + `grantPoints` 调用 + `refreshProfile`。
   - `App.tsx`：新增 `/points/tasks` 路由。
4. **Context**
   - `contexts/AuthContext.tsx`：保持 `refreshProfile` 接口，任务完成后刷新积分显示。
5. **构建验证**
   - 运行 `npm run build` 以确保新依赖与路由正常。

## 交付物
- 可执行的 `grant_points` + `redeem_points` RPC。
- 积分购物车 `Points` 页面与任务页。