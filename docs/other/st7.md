已完成认领，生态 7 已标记为 **🚧 进行中（Agent-7）**。

---

## 认领摘要

| 项目 | 内容 |
|------|------|
| **生态编号** | 7 |
| **生态名称** | 宠物遗传基因库与繁育系统 |
| **专属目录** | `lib/api/genetics.ts`、`lib/api/breeding.ts`、`pages/Bloodline*.tsx`、`pages/Breeding*.tsx` |
| **数据库表** | `pet_bloodlines`、`breeding_listings`、`breeding_logs`、`bloodline_certificates` |

---

## 执行计划

1. **数据库迁移**：创建 `supabase/migrations/2026-02-21-add-ecosystem-7-genetics.sql`，新增表并扩展 `pets` 表
2. **API 层**：实现 `lib/api/genetics.ts`（血统查询、近亲分析）、`lib/api/breeding.ts`（配对评分、市场、证书）
3. **页面**：实现 `BloodlineQuery`、`BreedingMarket`、`BreedingPairScore`、`BloodlineCertificate`
4. **共享资源**：在 `types.ts` 中追加类型，在 `App.tsx` 中追加路由

---

## 边界约束

- 不修改其他生态的专属文件
- 对 `pets` 表仅追加列，不删除或修改已有列
- 对 `types.ts` 仅追加类型，使用前缀命名（如 `Bloodline*`、`Breeding*`）

如需，我可以按上述计划开始实现。