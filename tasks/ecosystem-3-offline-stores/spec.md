# Spec：线下门店体验中心

> **生态编号**：3
> **状态**：🚧 进行中（Agent-3 认领）
> **预计工时**：32h
> **核心价值**：从纯线上转向 OMO，提高转化与复购

---

## Goal

落地线下门店体验中心，实现门店预约核销、店员端能力、宠物专业测评套餐、会员卡与门店绑定。

---

## 功能清单

- 门店预约与核销（积分/优惠券）
- 店员端小程序（门店的 AI 助手，可独立或内嵌）
- 宠物专业测评套餐（生成专属报告）
- 会员卡与门店绑定
- 运营玩法：门店每月挑战赛、店员排行榜
- 合作方：宠物医院链、宠物美容、训练基地

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/stores.ts` |
| 页面 | `pages/StoreBooking.tsx`、`pages/StoreList.tsx`、`pages/StoreDetail.tsx`、`pages/StoreStaffApp.tsx`（或独立） |

---

## 共享资源（只读/只增）

- `lib/api/points.ts`：积分/优惠券核销
- 优惠券逻辑：可新增 `lib/api/coupons.ts`（本生态专属）或复用 points 兑换

---

## 数据库变更

- `stores`：门店信息
- `store_bookings`：预约记录与核销状态
- `store_memberships`：会员卡与门店绑定
- `store_staff`：店员信息（若做店员端）
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-3-stores.sql`

---

## API/DB Touch

- 新增：`lib/api/stores.ts`（门店列表、预约、核销、会员卡）
- 复用：`lib/api/points.ts`

---

## 验收标准

- [x] 用户可浏览门店、预约服务（积分/优惠券核销）
- [x] 预约记录可查看、核销
- [x] 会员卡与门店绑定（API 已实现 bindStoreMembership，页面可后续扩展）
- [ ] 宠物专业测评套餐可生成专属报告（MVP 可简化，待后续迭代）
- [x] 店员端能力（MVP 可仅 Web 内嵌页）
- [x] `npm run build` 通过
- [x] 未修改其他生态专属文件

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
