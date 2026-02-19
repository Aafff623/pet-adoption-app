---
name: mcp-manager
description: 按需开启/关闭 MCP 服务。当用户说"开启 xxx MCP"、"关闭 yyy MCP"、"MCP 太多了"、"管理 MCP"、"禁用 MCP"时触发。
---

# MCP 按需管理技能

**触发词**：开启 MCP、关闭 MCP、禁用 MCP、MCP 太多了、管理 MCP、按需开启、enable MCP、disable MCP

---

## 一、MCP 配置文件位置

| 作用域 | 路径 |
|--------|------|
| 全局（所有项目） | `C:\Users\Lenovo\.cursor\mcp.json` |
| 项目级 | `.cursor/mcp.json`（项目根目录） |

优先使用**全局配置**管理所有服务的开关状态。

---

## 二、已知 MCP 服务清单

| 服务名 | 用途 | 默认状态 |
|--------|------|----------|
| `context7` | 库/框架文档实时查询 | **开启** |
| `cursor-ide-browser` | 浏览器自动化、网页测试 | 关闭 |
| `pinecone` | 向量数据库、语义检索 | 关闭 |
| `supabase` | Supabase 数据库操作 | 关闭 |
| `firebase` | Firebase 项目管理 | 关闭 |
| `figma` | 设计稿查看与代码生成 | 关闭 |
| `greptile` | AI 代码审查 | 关闭 |
| `Notion` | Notion 工作区读写 | 关闭 |

---

## 三、开启/关闭语法

编辑 `mcp.json`，为服务添加或删除 `"disabled": true`：

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "<TOKEN>"],
      "disabled": true
    }
  }
}
```

- **开启**：删除 `"disabled": true` 这一行（或设为 `false`）
- **关闭**：添加 `"disabled": true`

修改后**必须重启 Cursor** 才能生效（按 `Ctrl+Shift+P` → `Reload Window`）。

---

## 四、操作步骤

用户要求开启/关闭某个 MCP 时，按以下步骤执行：

1. **Read** `C:\Users\Lenovo\.cursor\mcp.json`，查看当前配置
2. 定位目标服务，添加或删除 `"disabled": true`
3. **Write** 保存文件
4. 提示用户：`已修改，请重启 Cursor（Ctrl+Shift+P → Reload Window）生效`

---

## 五、场景预设

常用场景的快速配置见 [presets.md](presets.md)。

对话示例：

- "开启 figma MCP" → 找到 `figma` 条目，删除 `"disabled": true`
- "关闭所有 MCP，只保留 context7" → 对其他所有服务添加 `"disabled": true`
- "切换到数据库场景" → 参考 presets.md 中的「后端/数据库」预设

---

## 六、注意事项

- 服务 Token/Key 等敏感字段**不要修改**，只改 `disabled` 标志
- 如果 `mcp.json` 中某服务条目不存在，需先补全完整配置（见 presets.md）再设置 `disabled`
- 同时开启过多服务会增加 AI 的 token 消耗，建议只开启当前任务需要的服务
