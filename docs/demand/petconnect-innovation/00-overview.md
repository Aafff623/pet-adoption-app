# PetConnect Innovation Roadmap

> **状态**：🔄 执行中
> **主题**：创新功能分阶段交付
> **广播方案**：半径级广播（基于经纬度）
> **交付策略**：一个功能一个功能实现，单项验收通过后进入下一阶段

## 目标

在不破坏现有领养主链路的前提下，逐步交付 6 个差异化功能，优先完成高价值、高传播能力模块。

## 阶段索引

| 阶段 | 文件 | 状态 | 预计工时 | 核心价值 |
|---|---|---|---:|---|
| Phase 1 | [phase-1-lost-alert-mvp.md](./phase-1-lost-alert-mvp.md) | ⬜ 待执行 | 20h | 失踪宠物应急广播，快速扩散求助信息 |
| Phase 2 | [phase-2-ai-adoption-match.md](./phase-2-ai-adoption-match.md) | ⬜ 待执行 | 24h | AI 领养匹配评分，提高匹配质量 |
| Phase 3 | [phase-3-trusted-adoption-milestones.md](./phase-3-trusted-adoption-milestones.md) | ⬜ 待执行 | 18h | 可信领养流程，减少沟通与纠纷 |
| Phase 4 | [phase-4-rescue-task-board.md](./phase-4-rescue-task-board.md) | ⬜ 待执行 | 20h | 救助协作任务板，多人协同执行 |
| Phase 5 | [phase-5-ai-health-diary.md](./phase-5-ai-health-diary.md) | ⬜ 待执行 | 26h | AI 健康日记，趋势分析与提醒 |
| Phase 6 | [phase-6-pwa-offline-rescue-kit.md](./phase-6-pwa-offline-rescue-kit.md) | ⬜ 待执行 | 16h | 离线救助包，弱网可用性提升 |

## 统一交付约定

- 数据库变更统一使用 `supabase/migrations/*.sql` 管理。
- 前端只通过 `lib/api/*.ts` 访问 Supabase，UI 不直接写数据库。
- 每阶段完成后执行 `npm run build`，并提供手测验收步骤。
- 每阶段完成后暂停，等待用户验收确认，再进入下一阶段。
- 所有阶段完成后，再统一进行 commit/push（需用户明确指令）。

## 风险与边界

- 位置相关能力（半径广播）涉及定位授权与经纬度精度，需要兜底逻辑。
- 涉及 AI 的阶段要沿用现有 `lib/api/llm.ts` 入口，避免模型接入分叉。
- PWA 离线能力需要和现有 `vite-plugin-pwa` 缓存策略兼容，避免脏缓存。

## 验收门禁

- 每阶段必须满足文档中的验收标准。
- 验收未通过不得切到下一阶段。
- 任一阶段发现架构风险时，先修正文档再改代码。

## 📍 当前进度（Agent 接手请读此处）

- **最后更新**：2026-02-20
- **已完成**：需求拆分与阶段文档初始化
- **进行中**：Phase 1 准备实施（半径级应急广播）
- **待执行**：Phase 2 ~ Phase 6

**下一步**：进入 [phase-1-lost-alert-mvp.md](./phase-1-lost-alert-mvp.md)，按数据库 -> API -> 页面 -> 验收顺序实现。
