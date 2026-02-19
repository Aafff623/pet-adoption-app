# MCP 场景预设配置

按任务场景快速切换 MCP 组合。将对应片段合并到 `C:\Users\Lenovo\.cursor\mcp.json` 的 `mcpServers` 中。

---

## 场景一：日常开发（最小集）

只保留文档查询，其余全部关闭。适合写代码、查 API、日常聊天。

**开启**：`context7`  
**关闭**：其余所有

```json
"cursor-ide-browser": { "disabled": true },
"pinecone":           { "disabled": true },
"supabase":           { "disabled": true },
"firebase":           { "disabled": true },
"figma":              { "disabled": true },
"greptile":           { "disabled": true },
"Notion":             { "disabled": true }
```

---

## 场景二：Web 开发 / 浏览器测试

需要自动化测试网页、截图、填写表单。

**额外开启**：`cursor-ide-browser`

```json
"cursor-ide-browser": {
  "command": "npx",
  "args": ["-y", "@cursor/browser-mcp@latest"]
}
```

操作：删除 `cursor-ide-browser` 条目中的 `"disabled": true`。

---

## 场景三：设计协作

查看 Figma 设计稿、生成组件代码、同步 Notion 设计文档。

**额外开启**：`figma` + `Notion`

```json
"figma": {
  "command": "npx",
  "args": ["-y", "figma-developer-mcp", "--figma-api-key", "<FIGMA_TOKEN>", "--stdio"]
},
"Notion": {
  "command": "npx",
  "args": ["-y", "@notionhq/notion-mcp-server"],
  "env": { "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer <NOTION_TOKEN>\"}" }
}
```

操作：删除以上两个服务的 `"disabled": true`。

---

## 场景四：后端 / Supabase 数据库

直接操作数据库、执行 SQL、管理 RLS 规则。

**额外开启**：`supabase`

```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "<SUPABASE_TOKEN>"]
}
```

操作：删除 `supabase` 条目中的 `"disabled": true`。

---

## 场景五：Firebase 项目

管理 Firebase 项目、Firestore、Authentication、Edge Functions。

**额外开启**：`firebase`

```json
"firebase": {
  "command": "npx",
  "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
}
```

操作：删除 `firebase` 条目中的 `"disabled": true`。

---

## 场景六：代码审查

对 PR/提交进行 AI 代码审查，查看 Greptile 建议。

**额外开启**：`greptile`

```json
"greptile": {
  "command": "npx",
  "args": ["-y", "greptile-mcp"],
  "env": { "GREPTILE_API_KEY": "<GREPTILE_KEY>" }
}
```

操作：删除 `greptile` 条目中的 `"disabled": true`。

---

## 场景七：向量检索 / RAG

语义搜索、向量数据库写入与查询。

**额外开启**：`pinecone`

```json
"pinecone": {
  "command": "npx",
  "args": ["-y", "@pinecone-database/mcp"],
  "env": { "PINECONE_API_KEY": "<PINECONE_KEY>" }
}
```

操作：删除 `pinecone` 条目中的 `"disabled": true`。

---

## 快速切换指令示例

对 AI 说：

| 用户指令 | AI 操作 |
|----------|---------|
| 开启浏览器 MCP | 删除 `cursor-ide-browser` 的 `disabled` 字段 |
| 关闭 figma MCP | 给 `figma` 添加 `"disabled": true` |
| 切换到设计场景 | 开启 figma + Notion，关闭其余非必要服务 |
| 只保留 context7 | 给除 context7 外所有服务添加 `"disabled": true` |
| 查看当前 MCP 状态 | Read `C:\Users\Lenovo\.cursor\mcp.json` 并列出各服务状态 |

每次修改后：**Ctrl+Shift+P → Reload Window** 重启 Cursor 使配置生效。
