# AI 功能参考

## 文件清单

| 文件 | 职责 |
|------|------|
| `lib/api/llm.ts` | 统一入口，按 VITE_LLM_PROVIDER 分发到各 provider |
| `lib/api/llmProviders/deepseek.ts` | DeepSeek API 调用 |
| `lib/api/llmProviders/doubao.ts` | 火山方舟豆包 API 调用 |
| `lib/api/gemini.ts` | Gemini API 调用（@google/generative-ai） |
| `lib/config/aiAgents.ts` | 智能体配置：systemPrompt、tone、maxTokens |
| `lib/utils/aiGuard.ts` | 防滥用校验：长度、冷却、重复 |
| `lib/utils/autoReply.ts` | 真人模拟词库，寄养家庭回复 |
| `pages/ChatDetail.tsx` | 调用 generateAgentReply，集成 aiGuard |
| `pages/Messages.tsx` | AI 智能体入口卡片 |

---

## aiGuard 常量

| 常量 | 默认值 | 说明 |
|------|--------|------|
| `MAX_MESSAGE_LENGTH` | 400 | 超过此长度不调用 AI |
| `COOLDOWN_MS` | 15000 | 上次 AI 回复后冷却时间（毫秒） |
| `RECENT_USER_MESSAGES_COUNT` | 4 | 用于重复检测的最近消息数 |
| `MIN_MESSAGE_LENGTH` | 1 | 低于此长度不调用 AI |

---

## Provider API 端点

| Provider | API URL | 模型/参数 |
|----------|---------|-----------|
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | model: `deepseek-chat` |
| 豆包 | `https://ark.cn-beijing.volces.com/api/v3/chat/completions` | model: `VITE_DOUBAO_MODEL_ID`（endpoint ID） |
| Gemini | 通过 @google/generative-ai SDK | model: `gemini-pro` |

---

## DIALOGUE_DB 结构

```typescript
{ keywords: string[]; replies: string[]; matchWhenShortOnly?: boolean }
```

- `keywords`：匹配用户消息的关键词（`trimmed.includes(kw)`）
- `replies`：随机选取一条回复
- `matchWhenShortOnly`：为 true 时仅当消息长度 ≤ `SHORT_MESSAGE_MAX_LEN`（6）才匹配，用于「确认」类避免误匹配

---

## AiAgentConfig 结构

```typescript
{
  id: AgentType;
  name: string;
  systemPrompt: string;
  tone: string;
  maxTokens: number;
}
```

`ANTI_ABUSE_RULES` 会附加到每个智能体的 systemPrompt 末尾。
