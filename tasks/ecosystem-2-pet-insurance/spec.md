# Spec：宠物险与健康保障中心

> **生态编号**：2
> **状态**：✅ 已完成
> **预计工时**：35h
> **核心价值**：提高用户粘性与 ARPU 值，建立金融闭环

---

## Goal

落地宠物险与健康保障中心，实现险种推荐、在线理赔、积分抵扣保费、健康日记与理赔联动。

---

## 功能清单

- 秒杀险种推荐（基于宠物年龄、历史就诊记录）
- 理赔流程在线化（拍照上传病历秒审）
- 积分可抵扣保费（积分→保障）
- 健康日记与理赔联动（日记数据做风控）
- 数据驱动：宠物健康趋势预测→精准险种推荐
- 合作方：保险公司、宠物医院

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/insurance.ts` |
| 页面 | `pages/InsuranceCenter.tsx`、`pages/InsuranceClaim.tsx`、`pages/InsuranceProductDetail.tsx` |

---

## 共享资源（只读/只增）

- `lib/api/healthDiary.ts`：**只读**，用于理赔风控与险种推荐
- `lib/api/points.ts`：调用积分抵扣
- `lib/api/healthInsights.ts`：读取健康趋势（可选）

---

## 数据库变更

- `insurance_products`：险种产品表
- `pet_insurance_policies`：用户投保记录
- `insurance_claims`：理赔申请与状态
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-2-insurance.sql`

---

## API/DB Touch

- 新增：`lib/api/insurance.ts`（险种列表、推荐、投保、理赔提交）
- 只读：`lib/api/healthDiary.ts`、`lib/api/healthInsights.ts`
- 复用：`lib/api/points.ts`（redeemPoints 抵扣）

---

## 验收标准

- [x] 用户可浏览险种列表，基于宠物年龄/健康记录获得推荐
- [x] 支持积分抵扣保费
- [x] 理赔流程：上传病历照片→提交→状态追踪
- [x] 健康日记数据可用于风控（MVP 可简化）
- [x] `npm run build` 通过
- [x] 未修改 healthDiary 表结构/RLS

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
