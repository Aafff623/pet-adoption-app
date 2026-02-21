认领已完成，状态已更新。

---

## 认领确认

**生态编号**：5  
**生态名称**：宠物电商与积分商城升级  
**认领者**：Agent-5  
**专属目录**：
- API：`lib/api/shops.ts`、`lib/api/products.ts`
- 页面：`pages/ShopList.tsx`、`pages/ShopDetail.tsx`、`pages/ProductDetail.tsx`、`pages/OrderConfirm.tsx`
- 组件：`components/ProductCard.tsx`、`components/ShopHeader.tsx`

**共享资源**（只读/只增）：
- `lib/api/points.ts`：积分 + 现金混合支付
- `pages/Points.tsx`：积分中心，可增加电商入口
- 现有 `pages/Redeem*.tsx`：不删除原有兑换逻辑

---

## 执行计划

| 阶段 | 任务 | 说明 |
|------|------|------|
| 1 | 数据库迁移 | 新建 `brand_shops`、`products`、`orders`、`product_reviews` 表及 RLS |
| 2 | API 层 | 实现 `shops.ts`（店铺 CRUD）、`products.ts`（商品、订单、评价、积分抵扣） |
| 3 | 组件 | `ProductCard`、`ShopHeader` |
| 4 | 页面 | `ShopList` → `ShopDetail` → `ProductDetail` → `OrderConfirm` |
| 5 | 积分入口 | 在 `Points.tsx` 增加「积分商城」入口，在 `App.tsx` 增加路由 |
| 6 | 宠物推荐 | 基于宠物类型（猫/狗等）推荐商品（MVP 可简化） |

---

## 当前项目情况

- 已有 `lib/api/points.ts`（`redeemPoints`、`grantPoints`、`donatePoints`）
- 已有 `pages/Points.tsx` 和多个 `Redeem*.tsx` 兑换页
- 生态 2 的 `InsuranceProductDetail` 已实现积分 + 现金混合支付，可参考其模式
- 尚无 `shops.ts`、`products.ts` 及电商相关页面

---

是否按上述计划开始实现？我会从第 1 阶段（数据库迁移）开始。