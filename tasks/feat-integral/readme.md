# 积分延展 Feat Integral

## 目标
围绕现有积分商城（`pages/Points.tsx` + `lib/api/points.ts`）打造系统化、可持续的积分体系，以多渠道积分获益与兑付路径提高用户活跃度和业务变现能力。

## Tasks
1. **多维激励体系**<br>
   - 梳理当前积分增量节点：完成领养、发布、签到、参与活动等行为，并在 `lib/api/*` 或新的 `tasks` 逻辑中接入 `supabase` 事务以更新 `profiles.points`。
   - 设计“任务书”页面（例如 `pages/PointsTasks.tsx`）展示可完成奖励，并由 `lib/api/points.ts` 新增调用 `grant_points` 的函数。<br>
   - 确定积分等级/阶梯（例如铜/银/金）与对应权益阈值，列入设计稿或文档（可新增 `docs/integral.md`）。
2. **丰富兑换列表**<br>
   - 在 `pages/Points.tsx` 及兑换详情页中加入多样化奖励（医院折扣券、社群优先券、周边限量），并准备对应的 `pages/Redeem*` 页面结构。
   - 补充每种奖励的兑换逻辑（调用 `lib/api/points.ts` 与 `redeem_points`），并同步 `redeem_points` 调用说明到 `tasks/feat-integral/README.md`。
3. **任务与成长路径**<br>
   - 设计“成长任务书” UI（例如 `pages/PointsTasks.tsx`，目前描述多维激励场景），用户完成任务解锁额外积分或特别兑换品，记录在新的 `types` 或 `lib/api/tasks.ts`。
   - 每个任务完成后要刷新 `AuthContext` 的 `profile`（调用 `refreshProfile`）以展示最新余额，同时新增 `lib/api/points.ts` 的 `grantPoints` 调用；在文档中说明每日/每周限制。
4. **社群与公益联动**<br>
   - 增加“积分捐赠”/“积分换票参与公益”活动，使积分不仅用于个人奖励，还能与救助项目关联（可能需要新 API，如 `lib/api/donations.ts`）。
   - 拍摄一份产品运营文档草案，写入 `tasks/feat-integral/README.md` 作为未来活动参考。

## Next Steps
- 确认数据库迁移顺序（已经新增 `supabase/migrations/2026-02-21-add-points-mall.sql`）；如需再加表或函数，应补充到 `schema.sql` 与 `master.sql`。
- 先做一个 MVP 版本：扩充 `Points` 页内容 + 两条新兑换品，再在后续迭代补全任务系统与公益功能。

## 积分兑换明细
| itemKey | 奖励 | 消耗 | 备注 |
| --- | --- | --- | --- |
| adoption-priority | 领养优先券 | 300 | 置顶申请，限每月 2 张。 |
| health-report | AI 健康报告 | 180 | 生成宠物健康报告，支持导出。 |
| lucky-draw | 公益抽奖券 | 120 | 随机奖品，善款捐助救援站。 |
| hospital-checkup | 医院健康体检券 | 250 | 合作医院 7 折体检+加急预约。 |
| community-pass | 社群优先报名卡 | 220 | 优先沙龙/训练营与资料仓访问。 |
| merch-pack | 周边限量礼包 | 200 | 联名帆布袋、徽章、玩具，包邮。 |
- 将运营文案、兑换规则与 `redeem_points` 的 `itemKey` 列表同步到 `docs/promotion/points-events.md`，方便产品与运营协同。
