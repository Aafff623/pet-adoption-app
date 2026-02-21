---
name: ai-features
description: Guides AI agent features in petconnect-app including LLM providers (DeepSeek, Doubao, Gemini), anti-abuse constraints, prompt design, and keyword-based human simulation. Use when adding AI agents, changing LLM providers, adjusting rate limits, or modifying agent prompts.
---

# AI 功能规范

## 架构概览

```mermaid
flowchart TB
    subgraph Entry [统一入口]
        LLM[lib/api/llm.ts]
    end
    
    subgraph Providers [提供商]
        DS[DeepSeek]
        DB[豆包]
        GM[Gemini]
    end
    
    subgraph Config [配置]
        Agents[lib/config/aiAgents.ts]
        Guard[lib/utils/aiGuard.ts]
        Reply[lib/utils/autoReply.ts]
    end
    
    LLM -->|VITE_LLM_PROVIDER| DS
    LLM -->|VITE_LLM_PROVIDER| DB
    LLM -->|VITE_LLM_PROVIDER| GM
    LLM --> Agents
    LLM --> Guard
```

- **统一入口**：[lib/api/llm.ts](lib/api/llm.ts) 的 `generateAgentReply`，按 `VITE_LLM_PROVIDER` 分发
- **提供商**：`lib/api/llmProviders/deepseek.ts`、`doubao.ts`，以及 `lib/api/gemini.ts`
- **智能体配置**：[lib/config/aiAgents.ts](lib/config/aiAgents.ts)，含 systemPrompt、tone、maxTokens
- **防滥用**：[lib/utils/aiGuard.ts](lib/utils/aiGuard.ts)，消息长度、冷却、重复检测
- **真人模拟**：[lib/utils/autoReply.ts](lib/utils/autoReply.ts)，关键词词库

---

## 新增智能体流程

1. 在 [types.ts](types.ts) 的 `AgentType` 中增加新类型
2. 在 [lib/config/aiAgents.ts](lib/config/aiAgents.ts) 的 `AI_AGENTS` 中增加配置（含 systemPrompt、tone、maxTokens）
3. 在 [pages/Messages.tsx](pages/Messages.tsx) 的 AI 智能体入口增加卡片
4. `conversations.agent_type` 已支持任意字符串，无需迁移

---

## 防滥用规范

- **aiGuard 常量**：`MAX_MESSAGE_LENGTH`、`COOLDOWN_MS`、`RECENT_USER_MESSAGES_COUNT`
- **校验逻辑**：`shouldAllowAI(message, lastAiReplyTime, recentUserMessages)` 返回 `{ allow, fallback? }`
- **Prompt 约束**：在 aiAgents 的 systemPrompt 中附加 `ANTI_ABUSE_RULES`，要求模型对刷屏/重复内容简短回复

修改限流参数时，仅改 [lib/utils/aiGuard.ts](lib/utils/aiGuard.ts) 中的常量。

---

## 环境变量速查

| Provider | 必填变量 |
|----------|----------|
| deepseek | `VITE_DEEPSEEK_API_KEY` |
| doubao   | `VITE_DOUBAO_API_KEY`、`VITE_DOUBAO_MODEL_ID` |
| gemini   | `VITE_GEMINI_API_KEY` |

切换 provider 时设置 `VITE_LLM_PROVIDER=deepseek|doubao|gemini`，默认 `deepseek`。

---

## 个性化设定原则

- **Prompt**：专业但口语化，避免「感谢您的咨询」等模板句，单条 80 字内
- **真人词库**：口语化、带语气词，避免 AI 味；`matchWhenShortOnly` 用于「确认」类避免误匹配（如「你可以帮我做什么」中的「可以」）

---

## 参考

- 文件清单、常量、API 端点详见 [reference.md](reference.md)

---

## 智能体头像配置

- **配置位置**：lib/config/aiAgents.ts 的 `AiAgentConfig.avatar` 字段
- **格式**：`data:image/svg+xml,%3C...%3E`（URL 编码 SVG）
- **应用场景**：
  - 消息列表显示：lib/api/messages.ts 在 `fetchConversations` 中自动从配置关联头像
  - 聊天页面：pages/ChatDetail.tsx 中会显示对方头像
- **去重机制**：同类系统会话（按 `agentType` 分组）去重，合并未读数，保留最新消息

新增或修改智能体时，务必在 `AiAgentConfig` 中配置 `avatar` 字段。

---

## 超长消息分段发送

当用户发送超过 400 字的消息（`MAX_MESSAGE_LENGTH`）时：

### 分段逻辑
- **阈值**：超过 400 字自动分段，每段最多 400 字
- **标记**：每段前缀添加 `[分 X/N]` 标签（如 `[分 1/3]\n消息内容`）
- **发送间隔**：分段消息间隔 200ms 逐段发送，防止后端限制

### AI 回复触发
- 对系统会话（含 AI 智能体），仅在用户最后一段消息发送后触发 AI 自动回复
- 使用**原始未分段的文本**进行防滥用检查（`shouldAllowAI`），确保一致性
- 超长消息本身不触发自动回复（防滥用），但用户可手动触发（发送第二条消息）

### 实现位置
- 分段逻辑：pages/ChatDetail.tsx 的 `handleSendMessage` 函数（行 140-235）
- 防滥用检查：lib/utils/aiGuard.ts 的 `shouldAllowAI`（支持环境变量 `VITE_AI_MAX_MESSAGE_LENGTH` 调整）

### 环境变量
| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_AI_MAX_MESSAGE_LENGTH` | 400 | 单条消息分段阈值（字符数） |

