# Spec：宠物遗传基因库与繁育系统

> **生态编号**：7
> **状态**：🚧 进行中（Agent-7）
> **预计工时**：38h
> **核心价值**：针对 breed 鉴赏者/繁育者的高价值功能

---

## Goal

落地宠物遗传基因库与繁育系统，实现血统查询、繁育配对评分、繁育交易市场、breeding 日志与血统证书。

---

## 功能清单

- 血统查询系统（输入品种+ID 查询近亲）
- 繁育配对评分（基于遗传特征预测后代）
- 繁育交易市场与信誉系统
- breeding 日志与血统证书生成
- 数据驱动：众筹宠物数据库（用户上传家族树）
- 变现：认证费用、交易手续费

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/genetics.ts`、`lib/api/breeding.ts` |
| 页面 | `pages/BloodlineQuery.tsx`、`pages/BreedingMarket.tsx`、`pages/BreedingPairScore.tsx`、`pages/BloodlineCertificate.tsx` |

---

## 共享资源（只读/只增）

- `pets` 表：扩展血统相关字段（仅追加，不删原有字段）
- `types.ts`：追加类型

---

## 数据库变更

- `pet_bloodlines`：血统/家族树数据
- `breeding_listings`：繁育交易挂牌
- `breeding_logs`：繁育记录
- `bloodline_certificates`：血统证书
- `pets` 表扩展：血统 ID、父母 ID 等（迁移脚本单独处理）
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-7-genetics.sql`

---

## API/DB Touch

- 新增：`lib/api/genetics.ts`、`lib/api/breeding.ts`（血统查询、配对评分、市场、证书）
- 扩展：`pets` 表（仅追加列），不破坏现有 RLS

---

## 验收标准

- [ ] 用户可输入品种+ID 查询血统/近亲
- [ ] 繁育配对评分可预测后代特征
- [ ] 繁育交易市场可挂牌、交易
- [ ] 可生成 breeding 日志与血统证书
- [ ] `npm run build` 通过
- [ ] 未删除 pets 表原有字段

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
