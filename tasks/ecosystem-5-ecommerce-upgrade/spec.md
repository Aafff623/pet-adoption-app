# Spec：宠物电商与积分商城升级

> **生态编号**：5
> **状态**：🚧 进行中（Agent-5）
> **预计工时**：40h
> **核心价值**：积分流量变现、供应链金融、SKU 丰富度

---

## Goal

升级宠物电商与积分商城，实现品牌入驻、店铺系统、秒杀预售、积分+现金混合支付、用户晒单评价激励。

---

## 功能清单

- 品牌入驻与店铺系统（品牌官方旗舰店）
- 秒杀与预售活动运营
- 积分+现金混合支付（兑换体验→购物体验）
- 用户晒单与评价激励（发泛化日记到商城）
- 数据驱动：宠物特征推荐商品（猫咪→猫粮、玩具等）
- 变现：佣金、广告位、品牌合作费

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/shops.ts`、`lib/api/products.ts` |
| 页面 | `pages/ShopList.tsx`、`pages/ShopDetail.tsx`、`pages/ProductDetail.tsx`、`pages/OrderConfirm.tsx` |
| 组件 | `components/ProductCard.tsx`、`components/ShopHeader.tsx` |

---

## 共享资源（只读/只增）

- `lib/api/points.ts`：积分+现金混合支付
- 现有 `pages/Redeem*.tsx`：可扩展入口，不删除原有兑换逻辑
- `pages/Points.tsx`：积分中心入口

---

## 数据库变更

- `brand_shops`：品牌店铺
- `products`：商品
- `orders`：订单
- `product_reviews`：评价晒单
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-5-ecommerce.sql`

---

## API/DB Touch

- 新增：`lib/api/shops.ts`、`lib/api/products.ts`（店铺、商品、订单、评价）
- 复用：`lib/api/points.ts`（混合支付）
- 扩展：现有 Redeem 页面可增加电商入口

---

## 验收标准

- [ ] 品牌可入驻开设店铺
- [ ] 用户可浏览店铺、商品，支持秒杀/预售
- [ ] 积分+现金混合支付
- [ ] 用户可晒单、评价
- [ ] 基于宠物特征推荐商品（MVP 可简化）
- [ ] `npm run build` 通过
- [ ] 未删除/破坏现有积分兑换流程

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
