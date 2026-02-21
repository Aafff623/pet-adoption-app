生态四「宠物社群与城市挑战赛」已认领并完成实现，交付内容如下：

---

## 认领与状态

- **索引**：`tasks/_ecosystem-parallel-index.md` 中生态四已标记为「进行中，Agent-4」
- **Spec**：`tasks/ecosystem-4-pet-challenges/spec.md` 已更新为进行中

---

## 交付清单

### 1. 数据库迁移
`supabase/migrations/2026-02-21-add-ecosystem-4-challenges.sql`

- `challenges`：挑战赛定义（标题、奖励、小队规模、时间等）
- `challenge_teams`：小队信息
- `challenge_participants`：参与记录
- `achievement_badges`：成就徽章
- 种子数据：2 条示例月度挑战

### 2. API 层
`lib/api/challenges.ts`

- `fetchChallenges` / `fetchChallengeById`：挑战列表与详情
- `joinChallenge` / `createChallengeTeam` / `joinChallengeTeam`：参与与小队
- `fetchChallengeLeaderboard` / `fetchChallengeTeams` / `fetchTeamMembers`：排行榜与小队成员
- `fetchUserBadges`：用户成就徽章
- `grantChallengeReward`：积分奖励（调用 `points.ts`）

### 3. 页面
- **ChallengeBoard**：挑战赛列表，支持按状态筛选
- **ChallengeDetail**：挑战详情、参与、小队、排行榜
- **ChallengeTeam**：小队详情与成员
- **AchievementBadges**：成就徽章列表与分享

### 4. 路由与入口
- 路由：`/challenges`、`/challenges/:id`、`/challenges/:challengeId/team/:teamId`、`/achievement-badges`
- BottomNav「+」菜单：新增「城市挑战赛」
- Profile：新增「城市挑战赛」「成就徽章」入口

### 5. 类型
`types.ts` 中新增：`Challenge`、`ChallengeParticipant`、`ChallengeTeam`、`AchievementBadge` 等

---

## 验收

- `npm run build` 通过
- 未修改其他生态专属文件
- 共享资源仅做追加（`types.ts`、`App.tsx`、`BottomNav.tsx`、`Profile.tsx`）

---

**下一步**：执行迁移后，在 Supabase 中应用 `2026-02-21-add-ecosystem-4-challenges.sql`。完成后可在索引中标记生态四为「已完成」。