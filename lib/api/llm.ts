import type { AgentType } from '../config/aiAgents';
import { generateAgentReply as generateDeepSeek } from './llmProviders/deepseek';
import { generateAgentReply as generateDoubao } from './llmProviders/doubao';
import { generateAgentReply as generateGemini } from './gemini';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

type LlmProvider = 'deepseek' | 'doubao' | 'gemini';

function getProvider(): LlmProvider {
  const p = (import.meta.env.VITE_LLM_PROVIDER as string)?.toLowerCase?.()?.trim();
  if (p === 'doubao' || p === 'gemini') return p;
  return 'deepseek';
}

/**
 * 调试用：返回当前 provider 及是否已配置 API Key（不暴露 key 值）。
 * 当 AI 回复失败时可在控制台调用，便于排查「无 key」与「API 失败」。
 */
export function getLlmDebugInfo(): { provider: string; hasKey: boolean } {
  const provider = getProvider();
  switch (provider) {
    case 'doubao': {
      const key = (import.meta.env.VITE_DOUBAO_API_KEY as string)?.trim?.();
      const modelId = (import.meta.env.VITE_DOUBAO_MODEL_ID as string)?.trim?.();
      return { provider: 'doubao', hasKey: !!(key && modelId) };
    }
    case 'gemini': {
      const key = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim?.();
      return { provider: 'gemini', hasKey: !!key };
    }
    case 'deepseek':
    default: {
      const key = (import.meta.env.VITE_DEEPSEEK_API_KEY as string)?.trim?.();
      return { provider: 'deepseek', hasKey: !!key };
    }
  }
}

/**
 * 根据当前配置的 provider 调用对应模型生成智能体回复。
 * 无 key 或 API 失败时返回 null，调用方应降级为词库回复。
 */
export async function generateAgentReply(
  agentType: AgentType,
  userMessage: string,
  history: ChatTurn[] = []
): Promise<string | null> {
  const provider = getProvider();

  switch (provider) {
    case 'doubao':
      return generateDoubao(agentType, userMessage, history);
    case 'gemini':
      return generateGemini(agentType, userMessage, history);
    case 'deepseek':
    default:
      return generateDeepSeek(agentType, userMessage, history);
  }
}
