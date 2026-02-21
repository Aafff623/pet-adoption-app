# Phase 2：丰富兑换与运营活动

## 目标
在 Points 页面引入多种兑换品（线下折扣券、社群权益）并准备运营活动引导，连接法人合作资源。 

## 状态
- [x] 已完成

## 技术拆分
1. **UI/页面**
   - 延展 `points/` 列表，加入医院健康体检券、社群优先报名卡、周边限量抽奖券。
   - 每个兑换项对应新的详情页面（如 `pages/RedeemPartnerDiscount.tsx` 等）描述礼包与规则。
2. **文案与运营规则**
   - 在 `docs/promotion/points-events.md` 撰写运营计划，包括活动周期、奖励池、复购优惠；描述积分可转公益。
3. **API与安全**
   - 复用 `redeem_points` RPC，每个兑换均传入 `itemKey` 。如需限量，把兑换记录写入 `points_transactions` 中并在 Supabase 创建 `points_locks` 表（可选）。
4. **用户反馈**
   - 兑换成功后在 `showToast` 显示剩余积分与价值提示，更新 `BottomNav` 中的快速入口。