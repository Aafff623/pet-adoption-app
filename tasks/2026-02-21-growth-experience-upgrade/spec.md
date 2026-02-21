# Spec

## Goal

- 落地“增长体验升级”实施：修复关键交互缺陷，完善积分任务验证链路，补齐深色模式适配，并完成 AI 智能体扩容与运营玩法规划。

## Acceptance Criteria

- [x] 积分任务中“发布求领养”“救助任务参与”不再一键完成，需跳转至对应业务页完成验证。
- [x] 积分公益捐赠不再直接扣分；点击后进入详情页，包含留言板、捐赠方式与反馈建议入口。
- [x] 消息中心批量选择具备“删除”和“标记已读”两个可用操作。
- [x] 对话页加号功能项点击有反馈（至少可选文件/图片与位置占位）。
- [x] 实名认证页面在 dark mode 下视觉可读、样式统一。
- [x] 消息页支持扩展智能体入口并可发起新会话。
- [x] 针对“有领养申请/领养记录用户”具备 10 天周期评分报告推送机制（MVP）。
- [x] `npm run build` 通过。

## Scope

- In scope:
  - PointsTasks 流程校验改造
  - PointsDonate 新页面与路由
  - Messages 批量标记已读
  - ChatDetail 附件入口可用化
  - Verification 深色模式修复
  - AI agent 配置扩展与消息页渲染改造
  - 周期评分报告（客户端惰性触发 MVP）
  - 规划文档输出（设计、bug、扩展路线）
- Out of scope:
  - 服务端 Cron/Edge Function 定时任务正式化
  - 完整的收藏页重构上线
  - 首页所有新业务卡片一次性上线

## API/DB Touch

- API 变更：
  - `lib/api/points.ts`：沿用 `donatePoints`，任务完成方式从手动发分转为跳转验证
  - `lib/api/messages.ts`：复用 `markConversationRead` / `insertSystemReply`
- DB 变更：
  - 复用已存在 `donate_points` RPC 与 `points_donations` 表
  - 周期评分报告 MVP 不新增表（使用本地时间戳去重）

## Linked Demand Doc

- 关联需求文档：`tasks/feat-integral/phase3.md`
