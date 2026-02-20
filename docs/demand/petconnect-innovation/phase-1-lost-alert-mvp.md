# Phase 1：失踪宠物应急广播（半径级）

> **状态**：⬜ 待执行
> **预计工时**：20h
> **前置条件**：无
> **目标**：上线可发布、可检索、可反馈线索的失踪宠物应急广播 MVP（按半径过滤）

## 核心交付物

- 失踪警报主流程：发布、浏览、详情、关闭。
- 线索反馈流程：任意登录用户提交 sighting 线索。
- 半径筛选：基于用户定位 + 经纬度距离过滤（默认 3km/10km/30km）。
- 运营可见字段：紧急等级、最后目击时间、联系方式说明。

## 新增依赖

- 无（优先使用原生 `navigator.geolocation` 与 SQL 计算）。

## 数据库变更

- 新增迁移：`supabase/migrations/add_lost_pet_alerts.sql`
- 新表：`public.lost_pet_alerts`
  - 关键字段：`id`, `user_id`, `pet_name`, `pet_type`, `pet_breed`, `pet_color`, `pet_gender`, `pet_age_text`, `avatar_url`, `description`, `lost_at`, `last_seen_at`, `location_text`, `latitude`, `longitude`, `radius_km`, `reward_text`, `contact_note`, `status`, `is_urgent`, `created_at`, `updated_at`, `closed_at`
  - 状态约束：`status in ('active', 'closed')`
- 新表：`public.lost_pet_sightings`
  - 关键字段：`id`, `alert_id`, `reporter_id`, `sighting_note`, `location_text`, `latitude`, `longitude`, `sighted_at`, `contact_hint`, `created_at`
- 索引建议：
  - `idx_lost_alerts_status_created` (`status`, `created_at desc`)
  - `idx_lost_alerts_geo` (`latitude`, `longitude`)
  - `idx_lost_sightings_alert_created` (`alert_id`, `created_at desc`)
- RLS 策略：
  - `lost_pet_alerts`：
    - SELECT: `status='active'` 全员可读；作者可读自己的全部
    - INSERT/UPDATE: 仅作者 `auth.uid() = user_id`
  - `lost_pet_sightings`：
    - SELECT: 警报作者与线索提交者可读
    - INSERT: 登录用户可写 `auth.uid() = reporter_id`

## 新增/修改文件清单

- 新增 `lib/api/lostAlerts.ts`
- 新增 `pages/LostAlerts.tsx`
- 新增 `pages/PublishLostAlert.tsx`
- 新增 `pages/LostAlertDetail.tsx`
- 修改 `App.tsx`（新增路由）
- 修改 `pages/Home.tsx`（新增入口）
- 修改 `types.ts`（新增 `LostPetAlert` / `LostPetSighting` 类型）

## 核心实现（关键点）

- 定位权限：
  - 首次进入列表页询问定位权限。
  - 拒绝授权时回退到“仅最新发布”排序，不做半径过滤。
- 距离计算：
  - 客户端实现 Haversine 计算用于展示距离。
  - 服务端先按粗范围过滤（经纬度窗口），再客户端精筛。
- 数据一致性：
  - 关闭警报时写入 `status='closed'` 与 `closed_at`。
  - 已关闭警报仍可查看历史线索，但不可新增线索。

## 验收标准

- [ ] 登录用户可发布失踪警报，发布后在列表中可见。
- [ ] 列表支持 3km/10km/30km 半径筛选，展示距离文本。
- [ ] 其他用户可提交线索，警报发布者可在详情页查看。
- [ ] 发布者可关闭警报，关闭后列表默认不展示（或标记为已关闭）。
- [ ] 拒绝定位权限时页面仍可正常使用（退化为非半径模式）。
- [ ] `npm run build` 通过。

## 验收步骤（给用户）

1. A 账号发布警报（带经纬度）。
2. B 账号打开列表，授权定位，切换 3km/10km 检查结果差异。
3. B 账号进入详情提交线索。
4. A 账号查看线索并关闭警报。
5. 刷新页面，确认状态与显示逻辑正确。

## 风险与回滚

- 若定位失败率高，临时改为按城市过滤 + 半径可选关闭。
- 若距离过滤性能不足，后续阶段改造为 PostGIS/服务端 RPC。
