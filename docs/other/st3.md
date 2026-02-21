生态三（线下门店体验中心）已认领并完成实现，交付内容如下。

---

## 认领状态

- **生态编号**：3  
- **生态名称**：线下门店体验中心  
- **认领者**：Agent-3  
- **状态**：进行中  

---

## 交付清单

### 1. 数据库迁移

- `supabase/migrations/2026-02-21-add-ecosystem-3-stores.sql`
  - `stores`：门店信息
  - `store_staff`：店员信息
  - `store_bookings`：预约记录
  - `store_memberships`：会员卡与门店绑定
  - RPC：`store_booking_redeem`（预约 + 积分核销）、`store_booking_verify`（店员核销）
  - 种子数据：3 家演示门店

### 2. 类型与 API

- `types.ts`：新增 `Store`、`StoreBooking`、`StoreMembership`、`StoreStaff` 等类型
- `lib/api/stores.ts`：门店列表、详情、预约、核销、会员卡、店员端等接口

### 3. 页面

| 页面 | 路径 | 说明 |
|------|------|------|
| StoreList | `/stores` | 门店列表，支持按类型筛选 |
| StoreDetail | `/stores/:id` | 门店详情，含预约入口 |
| StoreBooking | `/stores/:id/booking` | 预约表单（服务类型、时间、宠物、积分抵扣） |
| StoreMyBookings | `/stores/my-bookings` | 我的预约列表 |
| StoreStaffApp | `/stores/staff` | 店员核销页（需先加入 `store_staff`） |

### 4. 入口与路由

- 首页快捷入口：新增「线下门店」卡片
- `App.tsx`：新增上述 5 条路由
- StoreList 右上角：我的预约入口

---

## 验收情况

- [x] 用户可浏览门店、预约服务（积分核销）
- [x] 预约记录可查看、核销
- [x] 会员卡与门店绑定（API 已实现）
- [ ] 宠物专业测评套餐（MVP 暂未实现）
- [x] 店员端能力（Web 内嵌页）
- [x] `npm run build` 通过
- [x] 未修改其他生态专属文件

---

## 使用说明

1. **执行迁移**：在 Supabase 中执行 `2026-02-21-add-ecosystem-3-stores.sql`
2. **添加店员**：在 `store_staff` 表中插入 `(store_id, user_id)`，用户即可在 `/stores/staff` 核销
3. **访问门店**：首页点击「线下门店」或直接访问 `/stores`

完成开发后，可在 `tasks/_ecosystem-parallel-index.md` 中将生态三标记为「已完成」。