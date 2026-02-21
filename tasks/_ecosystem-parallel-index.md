# PetConnect 生态模块并行开发索引

> **用途**：多 Agent 并行开发时认领状态与文件边界一览
> **最后更新**：2026-02-21

---

## 认领状态

| 生态 | 名称 | 状态 | 认领者 | 专属目录 |
|:---:|---|:---:|---|---------|
| 1 | [社区宠物达人体系](./ecosystem-1-community-experts/spec.md) | ✅ 已完成 | Agent-1 | `lib/api/experts.ts`、`pages/Expert*.tsx`、`components/ExpertBadge.tsx` |
| 2 | [宠物险与健康保障中心](./ecosystem-2-pet-insurance/spec.md) | 🚧 进行中 | Agent-2 | `lib/api/insurance.ts`、`pages/Insurance*.tsx` |
| 3 | [线下门店体验中心](./ecosystem-3-offline-stores/spec.md) | 🚧 进行中 | Agent-3 | `lib/api/stores.ts`、`pages/Store*.tsx` |
| 4 | [宠物社群与城市挑战赛](./ecosystem-4-pet-challenges/spec.md) | 🚧 进行中 | Agent-4 | `lib/api/challenges.ts`、`pages/Challenge*.tsx` |
| 5 | [宠物电商与积分商城升级](./ecosystem-5-ecommerce-upgrade/spec.md) | 🚧 进行中 | Agent-5 | `lib/api/shops.ts`、`lib/api/products.ts`、`pages/Shop*.tsx`、`pages/Product*.tsx` |
| 6 | [AI 宠物健康顾问升级](./ecosystem-6-ai-health-advisor/spec.md) | 🚧 进行中 | Agent-6 | `lib/api/healthAdvisor.ts`、`pages/HealthAdvisorChat.tsx`、`pages/HealthAlerts.tsx`、`lib/config/aiAgents.ts`（扩展） |
| 7 | [宠物遗传基因库与繁育系统](./ecosystem-7-genetics-breeding/spec.md) | 🚧 进行中 | Agent-7 | `lib/api/genetics.ts`、`lib/api/breeding.ts`、`pages/Bloodline*.tsx`、`pages/Breeding*.tsx` |

**状态说明**：⬜ 待认领 | 🚧 进行中 | ✅ 已完成

---

## 专属文件边界（禁止跨模块修改）

| 生态 | 专属 API | 专属页面 | 专属组件 | 数据库表 |
|:---:|---|---------|---------|---------|---------|
| 1 | `experts.ts` | `ExpertProfile`、`ExpertColumn` | `ExpertBadge` | `expert_profiles`、`expert_follows`、`expert_tips`、`expert_earnings` |
| 2 | `insurance.ts` | `InsuranceCenter`、`InsuranceClaim` | - | `pet_insurance_policies`、`insurance_claims`、`insurance_products` |
| 3 | `stores.ts` | `StoreBooking`、`StoreStaffApp` | - | `stores`、`store_bookings`、`store_memberships` |
| 4 | `challenges.ts` | `ChallengeBoard`、`ChallengeTeam` | - | `challenges`、`challenge_participants`、`challenge_teams`、`achievement_badges` |
| 5 | `shops.ts`、`products.ts` | `ShopList`、`ProductDetail` | - | `brand_shops`、`products`、`orders`、`product_reviews` |
| 6 | `healthAdvisor.ts` | `HealthAdvisorChat` | - | `health_alerts`、`health_consultation_logs` |
| 7 | `genetics.ts`、`breeding.ts` | `BloodlineQuery`、`BreedingMarket` | - | `pet_bloodlines`、`breeding_listings`、`breeding_logs` |

---

## 共享资源（只读/只增，不删不改他模块逻辑）

| 资源 | 涉及生态 | 规则 |
|------|---------|------|
| `lib/api/points.ts` | 1、2、3、4、5 | 仅调用现有函数，不修改核心逻辑 |
| `lib/api/healthDiary.ts` | 2、6 | 只读调用，不修改表/RLS |
| `lib/config/aiAgents.ts` | 6 | 仅追加新 Agent，不删除已有 |
| `types.ts` | 全部 | 仅追加 interface/type，使用前缀命名 |
| `App.tsx` | 全部 | 仅追加 Route |
| `components/BottomNav.tsx` | 1、3、4、5 | 按需追加，不删已有入口 |

---

## 执行顺序建议

- **第一批（可并行）**：生态 1、3、4、7
- **第二批**：生态 5（积分商城升级）
- **第三批**：生态 6 → 生态 2（健康日记相关，6 先 2 后）
