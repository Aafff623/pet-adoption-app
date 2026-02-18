---
name: project-slimming
description: Safely slim down projects by removing redundant files and dependencies while ensuring delivery readiness and functionality. Use when the user asks for project slimming, cleanup, reducing project size, or preparing for delivery after testing.
---

# 项目瘦身 (Project Slimming)

## 核心原则（必须遵守）

1. **可交付性与功能优先**：任何删除操作前，必须确保项目可正常构建、运行、交付
2. **删除次之**：只有在不影响功能的前提下才执行删除
3. **可逆优先**：优先使用 `.gitignore` 排除，而非物理删除；删除前需确认无引用

---

## 执行流程

### Phase 0：前置验证（删除前必做）

```
- [ ] 运行构建命令（如 npm run build）成功
- [ ] 运行开发命令（如 npm run dev）成功
- [ ] 核心功能可正常访问（至少做一次冒烟验证）
- [ ] 如有测试：npm test 通过
```

**任一失败则不得进入删除阶段**，先修复问题。

---

### Phase 1：安全排除（仅改 .gitignore，不删文件）

| 目标 | 说明 | .gitignore 条目 |
|------|------|-----------------|
| 构建产物 | 每次 build 可重建 | `dist/` `dist-ssr/` `build/` `out/` |
| 依赖目录 | npm install 可重建 | `node_modules/` |
| 本地环境 | 含敏感信息，不提交 | `.env.local` `*.local` |
| 日志/缓存 | 运行时生成 | `*.log` `.playwright-mcp/` `.vite/` `.cache/` |
| IDE/系统 | 个人配置 | `.cursor/` `agent-transcripts/` `.idea/` `.DS_Store` |

**操作**：在 `.gitignore` 中补充缺失项，不删除已有文件。

---

### Phase 2：依赖瘦身（需验证）

1. 运行 `npx depcheck` 检查未使用依赖
2. 对每个「疑似未使用」的包：
   - 全局搜索引用（import/require）
   - 确认无引用后，从 `package.json` 移除
3. **每次移除一个依赖后**：执行 `npm run build` 验证
4. 失败则回滚该依赖

---

### Phase 3：资源瘦身（需验证）

| 类型 | 操作 | 验证方式 |
|------|------|----------|
| 图片 | 压缩大图、转 WebP | 页面加载正常、无 404 |
| 未使用资源 | 搜索引用后删除 | 构建成功、无 404 |
| 重复资源 | 合并后删除冗余 | 功能正常 |

**禁止**：删除 `public/` 下被路由或配置引用的文件。

---

### Phase 4：代码瘦身（高风险，谨慎）

| 操作 | 前置条件 |
|------|----------|
| 删除未使用组件/页面 | 已确认无路由、无 import |
| 删除死代码 | 已确认无动态调用、无反射引用 |
| 合并重复逻辑 | 已做回归验证 |

**禁止**：删除被 `index`、动态 import、路由配置引用的文件。

---

### Phase 5：文档与脚本整理

| 操作 | 说明 |
|------|------|
| 合并过时文档 | 将有效内容并入 README 或 docs 后删除 |
| 整理 SQL 迁移 | 合并已应用的迁移，保留可追溯版本 |
| 清理部署配置 | 移除无用规则，保留必要配置 |

**禁止**：删除数据库 schema、种子数据等生产依赖文件。

---

## 删除前检查清单

对任何待删除文件/目录：

- [ ] 是否在 `.gitignore` 中？若在，可只更新 `.gitignore`，不物理删除
- [ ] 是否被构建/部署流程引用？若引用，不删
- [ ] 是否被代码引用？若引用，不删
- [ ] 是否被文档/配置引用？若引用，不删
- [ ] 删除后是否可重建？若不可，需用户确认

---

## 常见项目类型速查

| 项目类型 | 可安全排除 | 禁止删除 |
|----------|------------|----------|
| Vite/React | dist, node_modules, .env.local | .env.local.example, public 被引用资源 |
| 含 Supabase | 同上 | schema.sql, supabase/*.sql（未确认前） |
| 含 Playwright | .playwright-mcp, test-results | playwright.config.* |

---

## 执行顺序总结

1. Phase 0 验证通过
2. Phase 1 更新 .gitignore
3. Phase 2 依赖瘦身（逐项验证）
4. Phase 3 资源瘦身（逐项验证）
5. Phase 4 代码瘦身（可选，高风险）
6. Phase 5 文档整理
7. 再次运行 Phase 0 验证

---

## 参考：典型 .gitignore 补充项

```gitignore
# 构建
dist/
dist-ssr/
build/
out/

# 依赖
node_modules/

# 本地环境
.env.local
*.local

# 工具/缓存
.playwright-mcp/
.vite/
.cache/
*.log

# IDE/系统
.cursor/
agent-transcripts/
.DS_Store
.idea
```
