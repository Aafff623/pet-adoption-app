# Global Rules

- 使用小步可审查的变更，避免一次性大改。
- 提交信息遵循 Conventional Commits：`feat|fix|refactor|chore|docs|test|perf|build|ci`。
- 严禁提交密钥、令牌、数据库密码；使用环境变量与 `.env.local`。
- 任何 API 变更都要同步更新类型定义与调用方。
- 合并前必须通过 `typecheck`、`lint`（如有）和 `build`。
- 优先修复根因，不做表层补丁。
