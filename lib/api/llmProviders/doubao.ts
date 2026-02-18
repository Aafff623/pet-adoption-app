import type { AgentType } from '../../config/aiAgents';
import { AI_AGENTS } from '../../config/aiAgents';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_DOUBAO_API_KEY as string | undefined;
  if (key && key.trim()) return key.trim();
  return undefined;
}

function getModelId(): string | undefined {
  const id = import.meta.env.VITE_DOUBAO_MODEL_ID as string | undefined;
  if (id && id.trim()) return id.trim();
  return undefined;
}

export async function generateAgentReply(
  agentType: AgentType,
  userMessage: string,
  history: ChatTurn[] = []
): Promise<string | null> {
  const apiKey = getApiKey();
  const modelId = getModelId();
  if (!apiKey || !modelId) return null;

  const config = AI_AGENTS[agentType];
  if (!config) return null;

  const systemContent =
    config.systemPrompt +
    `\n语气：${config.tone}。直接回答，不要重复用户问题，不要用「好的」「收到」敷衍。`;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemContent },
    ...history.map(t => ({
      role: (t.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: t.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const res = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: config.maxTokens,
        temperature: 0.85,
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;

    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }
    return null;
  } catch {
    return null;
  }
}
