# Skills Index (generated)

Generated at: 2026-02-21T12:09:39.764Z

Total: 12

- ai-features: Guides AI agent features in petconnect-app including LLM providers (DeepSeek, Doubao, Gemini), anti-abuse constraints, prompt design, and keyword-based human simulation. Use when adding AI agents, changing LLM providers, adjusting rate limits, or modifying agent prompts.
- dark-mode-design: Design and implementation guidelines for dark mode. Covers common pitfalls, color palette, Tailwind replacement patterns. Use when implementing dark mode, designing dark themes, or reviewing dark mode implementations.
- deploy: Guides Vercel deployment and PWA setup for petconnect-app. Use when deploying to Vercel, configuring PWA, adding to home screen, or troubleshooting deployment/auth/AI issues.
- ecosystem-task-spec: 回答 PetConnect 生态任务的设计规范、完成进度时间轴、交付验证。当用户问设计规格、spec、验收标准、进度、时间轴、交付情况、任务状态、认领情况时使用。按统一模板凝练输出，数据来自 tasks/、docs/demand/。
- github-batch-commits: Analyzes staged and modified files, groups them by feature, and guides batch commits. Use when the user says "提交到Github", "提交到 GitHub", "push to GitHub", or has many staged files from multiple features and wants to commit by feature.
- mcp-manager: 按需开启/关闭 MCP 服务。当用户说"开启 xxx MCP"、"关闭 yyy MCP"、"MCP 太多了"、"管理 MCP"、"禁用 MCP"时触发。
- phased-task-delivery: 将大型需求拆分为多阶段任务文档并分步交付。当用户说「拆分任务」「分阶段执行」「按需求文档实现」「分部交付」，或提供分析报告要求逐步实现时使用。自动在 docs/demand/<主题>/ 下建立 phases/ 目录，生成带状态标注的阶段文档，每阶段完成后更新状态、提供后续步骤，并询问是否 push。
- project-slimming: Safely slim down projects by removing redundant files and dependencies while ensuring delivery readiness and functionality. Use when the user asks for project slimming, cleanup, reducing project size, or preparing for delivery after testing.
- readme-deployment: 专业处理 README 与部署文档。Use when writing README, deployment guides, environment variable docs, or project structure documentation. 约定：README 必须包含环境变量表、获取 API Key 的链接、部署步骤、项目结构。
- readme-generator: Generates professional README files by synthesizing standard-readme, Best-README-Template, Google styleguide, and GitHub best practices. Use when creating or redesigning README.md, documenting projects, or when the user asks for README templates or best practices.
- repo-slimming: 项目仓库瘦身与规范。Use when cleaning repo, optimizing .gitignore, removing large files, or organizing project structure. 约定：脚本仅用 PowerShell / npm 跨平台命令，不生成 .sh 文件。
- supabase-calls: Guides Supabase usage in petconnect-app including MCP tool calls, migrations, RLS, and API layer conventions. Use when working with Supabase, executing SQL, applying migrations, list_tables, execute_sql, RLS policies, or database schema changes.
