# Spec

## Goal

- 优化 AI 智能体对话体验，包括：为消息中心的 AI 智能体配置专属头像、解决重复对话显示问题、放宽消息字数限制、实现超长消息自动分段发送

## Acceptance Criteria

- [x] AI 智能体在消息列表中显示配置的专属 SVG 头像（宠物专家黄色、情感顾问粉色），不再显示蓝色通知图标
- [x] 消息中心去重：同类智能体对话只显示一条（按 agentType 分组），合并未读计数
- [x] 字数限制可配置：支持通过环境变量 `VITE_AI_MAX_MESSAGE_LENGTH` 调整（默认 400）
- [x] 超长消息自动分段发送：超过 400 字自动分段，每段标记 `[分 X/N]`，200ms 间隔逐段发送
- [x] 改进输入体验：支持多行编辑 + Ctrl/Cmd+Enter 快捷发送
- [x] AI 回复限制仅在用户最后一段消息后触发，超长消息不触发自动回复（防滥用）
- [x] 本地构建通过，无 TypeScript 错误

## Scope

- In scope:
  - AI 智能体头像配置与消息列表显示
  - 消息中心同类对话去重与未读合并
  - 字数限制可配置化
  - 超长消息自动分段发送
  - 消息输入框多行编辑与快捷发送
  - 防滥用逻辑调整（超长消息不触发 AI 回复）
  
- Out of scope:
  - 修改 API 数据库结构
  - 非 AI 相关的消息功能优化

## API/DB Touch

- API 变更：无
- DB 变更：无（conversations 表已支持 agent_type 字段）

## Linked Demand Doc

- 相关需求：修复消息中心同类智能体对话显示重复问题、优化AI智能体对话体验

## Files Modified

- [lib/config/aiAgents.ts](lib/config/aiAgents.ts) - 添加 avatar 字段与配置
- [lib/api/messages.ts](lib/api/messages.ts) - 实现消息去重与头像关联
- [lib/utils/aiGuard.ts](lib/utils/aiGuard.ts) - 字数限制可配置化
- [pages/ChatDetail.tsx](pages/ChatDetail.tsx) - 超长消息分段与输入改进
- [pages/Messages.tsx](pages/Messages.tsx) - 消息列表头像显示逻辑

## Related Links

- 需求文档：该改动属于 AI 智能体功能优化，涉及 Messages/Chat 体验
- 相关 Skill：[.cursor/skills/ai-features](../../.cursor/skills/ai-features/SKILL.md)
