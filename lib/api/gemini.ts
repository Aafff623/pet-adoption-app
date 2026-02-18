import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentType } from '../config/aiAgents';
import { AI_AGENTS } from '../config/aiAgents';

const GEMINI_MODEL = 'gemini-pro';

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (key && key.trim()) return key.trim();
  return (typeof process !== 'undefined' && (process as { env?: Record<string, string> }).env?.GEMINI_API_KEY) || undefined;
}

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

/**
 * 调用 Gemini API 生成智能体回复。
 * 无 key 或 API 失败时返回 null，调用方应降级为词库回复。
 */
export async function generateAgentReply(
  agentType: AgentType,
  userMessage: string,
  history: ChatTurn[] = []
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const config = AI_AGENTS[agentType];
  if (!config) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: config.systemPrompt + `\n语气：${config.tone}。直接回答，不要重复用户问题，不要用「好的」「收到」敷衍。`,
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: 0.85,
      },
    });

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
      ...history.map(t => ({ role: t.role, parts: [{ text: t.content }] })),
      { role: 'user' as const, parts: [{ text: userMessage }] },
    ];

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text?.();

    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }
    return null;
  } catch {
    return null;
  }
}
