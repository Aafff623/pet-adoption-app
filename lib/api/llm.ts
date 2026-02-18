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
