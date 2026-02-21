# PetConnect 生态模块边界 — 非侵入开发规则

> **用途**：确保各生态开发时只修改自己范围内的文件，不侵入其他模块。
> **适用对象**：所有参与生态模块开发的 Agent。

---

## 核心原则

- **专属优先**：本生态的所有业务逻辑必须写在「专属文件」内
- **共享只增不删**：对 `types.ts`、`App.tsx` 等共享文件，只允许「新增」类型/路由，禁止删除或重写其他模块的代码
- **命名空间隔离**：新增类型使用前缀（如 `ExpertProfile`、`InsuranceClaim`、`ChallengeParticipant`），避免与其它生态冲突
- **API 层隔离**：每个生态独立 `lib/api/{ecosystem}.ts`，不直接修改其他生态的 API 文件

---

## 共享文件修改规则

| 文件 | 允许操作 | 禁止操作 |
|------|---------|---------|
| `types.ts` | 追加 interface/type | 修改已有类型、删除字段 |
| `App.tsx` | 追加 Route | 删除/修改其他 Route |
| `components/BottomNav.tsx` | 按需追加入口（需与产品确认） | 删除已有入口 |
| `lib/api/points.ts` | 调用现有函数 | 修改积分发放/扣减核心逻辑（需统一评审） |
| `lib/api/healthDiary.ts` | 只读调用 | 修改表结构、RLS（属生态 2、6 需协调） |
| `lib/config/aiAgents.ts` | 仅追加新 Agent | 删除/修改已有 Agent 配置 |

---

## 专属文件边界（禁止跨模块修改）

各生态的专属文件见 `tasks/_ecosystem-parallel-index.md`。**禁止**修改其他生态的专属文件，例如：

- 生态 1 Agent 不得修改 `lib/api/insurance.ts`、`pages/InsuranceCenter.tsx`
- 生态 2 Agent 不得修改 `lib/api/experts.ts`、`pages/ExpertProfile.tsx`
- 以此类推

---

## 数据库迁移

- 每个生态的迁移脚本命名：`YYYY-MM-DD-add-ecosystem-{N}-*.sql`
- 不修改其他生态已创建的表
- 外键关联 `profiles`、`pets` 时使用已有字段，不破坏现有 RLS
- 对 `pets`、`profiles` 等共享表，仅允许追加列，禁止删除列或修改已有列类型

---

## 验收自检

开发完成后，请确认：

- [ ] 未修改其他生态的专属文件
- [ ] `types.ts` 仅追加，未删除
- [ ] `npm run build` 通过
- [ ] 本生态功能在独立路由下可访问
- [ ] 共享资源（points、healthDiary 等）仅按规则使用
