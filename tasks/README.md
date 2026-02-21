# Tasks 说明

本目录用于管理开发任务卡，并与 `docs/demand` 下的 phase 需求文档建立对应关系，确保“需求 -> 实现 -> 验收”可追踪。

## 命名规则

任务目录命名采用：

`YYYY-MM-DD-phaseX-feature`

示例：

`2026-02-21-phase2-lost-alert-filter`

## 基本流程

1. 复制 `tasks/_template` 到新的任务目录。
2. 在 `spec.md` 中补全需求说明与验收条件。
3. 按 `spec.md` 开发并提交代码。
4. 完成后在 `done.md` 填写变更、测试与构建结果。

## CLI 快捷命令

- `npm run sync:skills`：同步 `.cursor/skills` 到 `.ai/skills/index.*`
- `npm run task:new -- <phase-doc-path> <feature-slug>`：从 phase 文档创建任务目录
- 示例：
	- `npm run task:new -- docs/demand/petconnect-innovation/phase-2-ai-adoption-match.md adoption-match-ui`
