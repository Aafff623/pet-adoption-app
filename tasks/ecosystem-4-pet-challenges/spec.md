# Spec：宠物社群与城市挑战赛

> **生态编号**：4
> **状态**：🚧 进行中（Agent-4）
> **预计工时**：28h
> **核心价值**：提高留存率、建立强社群认同、制造话题传播

---

## Goal

落地宠物社群与城市挑战赛，实现月度城市挑战、排行榜、小队任务、成就徽章与分享裂变。

---

## 功能清单

- 月度城市挑战赛（如「本月最会训练的狗主人」）
- 排行榜与奖励等级（现金、周边、积分翻倍）
- 社群组织工具（3~5 人小队任务）
- 成就徽章与分享裂变
- 数据驱动：基于用户行为自动推荐适合的挑战赛
- 变现：赞助商入口（品牌方可冠名赛事）

---

## 专属文件范围

| 类型 | 路径 |
|------|------|
| API | `lib/api/challenges.ts` |
| 页面 | `pages/ChallengeBoard.tsx`、`pages/ChallengeTeam.tsx`、`pages/ChallengeDetail.tsx`、`pages/AchievementBadges.tsx` |

---

## 共享资源（只读/只增）

- `lib/api/points.ts`：积分奖励发放
- `profiles`：用户信息

---

## 数据库变更

- `challenges`：挑战赛定义
- `challenge_participants`：参与记录
- `challenge_teams`：小队信息
- `achievement_badges`：成就徽章
- 迁移脚本：`supabase/migrations/YYYY-MM-DD-add-ecosystem-4-challenges.sql`

---

## API/DB Touch

- 新增：`lib/api/challenges.ts`（挑战列表、参与、小队、排行榜、徽章）
- 复用：`lib/api/points.ts`（grantPoints）

---

## 验收标准

- [x] 用户可浏览月度城市挑战赛、参与挑战
- [x] 排行榜展示，奖励等级（积分/周边等）
- [x] 支持 3~5 人小队组队任务
- [x] 成就徽章可获取、分享
- [x] 基于行为推荐挑战（MVP 可简化）
- [x] `npm run build` 通过
- [x] 未修改其他生态专属文件

---

## 开发约束（非侵入规则）

见 [docs/prompts/ecosystem-boundary-rules.md](../../docs/prompts/ecosystem-boundary-rules.md)
