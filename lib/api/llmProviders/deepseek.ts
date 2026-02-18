import type { AgentType } from '../../config/aiAgents';
import { AI_AGENTS } from '../../config/aiAgents';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;
  if (key && key.trim()) return key.trim();
  return undefined;
}

export async function generateAgentReply(
  agentType: AgentType,
  userMessage: string,
  history: ChatTurn[] = []
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

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
    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
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
