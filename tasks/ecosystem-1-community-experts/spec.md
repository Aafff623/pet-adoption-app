# Spec：社区宠物达人体系

> **生态编号**：1
> **状态**：✅ 已完成（Agent-1）
> **预计工时**：30h
> **核心价值**：将用户转化为内容生产者，提高平台 UGC 与活跃度

---

## Goal

落地社区宠物达人体系，实现达人认证、专栏、粉丝关系、打赏收益分成，以及精选达人内容在首页运营位展示。

---

## 功能清单

- 达人认证与等级（金牌训练师、营养师、医疗志愿者）
- 达人专栏与粉丝关系
- 达人打赏与收益分成
- 精选达人内容在首页运营位展示
- 数据驱动：利用既有积分、成长日志数据识别高价值用户
- 变现路径：达人收益分成、企业合作推广

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/experts.ts` |
| 页面 | `pages/ExpertProfile.tsx`、`pages/ExpertColumn.tsx`、`pages/ExpertList.tsx` |
| 组件 | `components/ExpertBadge.tsx`、`components/ExpertCard.tsx` |

---

## 共享资源（只读/只增）

- `lib/api/points.ts`：调用积分发放
- `profiles` 表：扩展达人相关字段（仅追加）
- `lib/api/petLogs.ts`：读取成长日志用于达人识别

---

## 数据库变更

- `expert_profiles`：达人档案（等级、认证类型、专栏简介）
- `expert_follows`：粉丝关注关系
- `expert_tips`：打赏记录
- `expert_earnings`：收益分成流水
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-1-experts.sql`

---

## API/DB Touch

- 新增：`lib/api/experts.ts`（达人 CRUD、关注、打赏、收益查询）
- 扩展：`profiles` 表（可选，或通过 expert_profiles 关联）
- 复用：`lib/api/points.ts`（grantPoints 等）

---

## 验收标准

- [x] 用户可申请达人认证，选择等级类型（训练师/营养师/医疗志愿者）
- [x] 达人拥有专栏页，展示内容与粉丝数
- [x] 粉丝可关注达人、打赏
- [x] 达人收益分成可查询
- [x] 首页有精选达人内容运营位
- [x] 基于积分、成长日志识别高价值用户（MVP 可简化）
- [x] `npm run build` 通过
- [x] 未修改其他生态专属文件

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
