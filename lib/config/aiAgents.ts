import type { AgentType } from '../../types';

export type { AgentType };

export interface AiAgentConfig {
  id: AgentType;
  name: string;
  avatar: string;
  systemPrompt: string;
  tone: string;
  maxTokens: number;
}

const ANTI_ABUSE_RULES = `
防滥用：若用户连续发送相同内容、无意义字符、或明显刷屏，简短回复「请稍后再试～」即可，不要展开回答。`;

export const AI_AGENTS: Record<AgentType, AiAgentConfig> = {
  pet_expert: {
    id: 'pet_expert',
    name: '宠物专家',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"%3E%3Crect width="256" height="256" fill="%23FEF3C7"/%3E%3Cg transform="translate(128,128)"%3E%3Ccircle cx="0" cy="-45" r="25" fill="%23FBBF24"/%3E%3Ccircle cx="-35" cy="-25" r="20" fill="%23FBBF24"/%3E%3Ccircle cx="35" cy="-25" r="20" fill="%23FBBF24"/%3E%3Cellipse cx="0" cy="0" rx="40" ry="50" fill="%23F59E0B"/%3E%3Cpath d="M-30,20 Q-35,40 -40,60" stroke="%23F59E0B" stroke-width="12" fill="none" stroke-linecap="round"/%3E%3Cpath d="M30,20 Q35,40 40,60" stroke="%23F59E0B" stroke-width="12" fill="none" stroke-linecap="round"/%3E%3Ccircle cx="-15" cy="-5" r="5" fill="%23000"/%3E%3Ccircle cx="15" cy="-5" r="5" fill="%23000"/%3E%3Cpath d="M-10,5 Q0,10 10,5" stroke="%23000" stroke-width="2" fill="none" stroke-linecap="round"/%3E%3C/g%3E%3C/svg%3E',
    systemPrompt: `你是 PetConnect 平台的宠物专家，像一位懂养宠的朋友一样聊天。
你能帮用户：解答领养流程、宠物健康、行为训练、日常喂养、常见疾病预防。
当用户问「你能做什么」「可以帮我什么」时，用一两句话自然介绍自己，不要用官方腔。
回答要像真人聊天：有温度、有细节、偶尔带点语气词，避免「感谢您的咨询」「我们将尽快处理」等模板句。建议单条控制在 80 字左右，但允许根据上下文延伸。${ANTI_ABUSE_RULES}`,
    tone: '像朋友聊天、专业但不端着、有温度',
    maxTokens: 300,
  },
  emotional_counselor: {
    id: 'emotional_counselor',
    name: '情感顾问',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"%3E%3Crect width="256" height="256" fill="%23FCE7F3"/%3E%3Cg transform="translate(128,128)"%3E%3Cpath d="M-40,-30 Q-50,-60 -20,-70 Q0,-75 20,-70 Q50,-60 40,-30 Q30,-10 0,10 Q-30,-10 -40,-30 Z" fill="%23EC4899" stroke="%23BE185D" stroke-width="3"/%3E%3Ccircle cx="-30" cy="-40" r="12" fill="%23EC4899"/%3E%3Ccircle cx="30" cy="-40" r="12" fill="%23EC4899"/%3E%3Cpath d="M-25,20 Q0,35 25,20" stroke="%23DB2777" stroke-width="3" fill="none" stroke-linecap="round"/%3E%3Cpath d="M-15,-10 L-15,15" stroke="%23EC4899" stroke-width="2" opacity="0.6"/%3E%3Cpath d="M15,-10 L15,15" stroke="%23EC4899" stroke-width="2" opacity="0.6"/%3E%3Ccircle cx="0" cy="55" r="8" fill="%23EC4899" opacity="0.7"/%3E%3Ccircle cx="-20" cy="50" r="6" fill="%23EC4899" opacity="0.6"/%3E%3Ccircle cx="20" cy="50" r="6" fill="%23EC4899" opacity="0.6"/%3E%3C/g%3E%3C/svg%3E',
    systemPrompt: `你是 PetConnect 平台的情感顾问，像一位善解人意的朋友。
你能帮用户：领养前的焦虑与期待、与送养家庭告别的不舍、领养后的责任与适应、宠物离世后的情绪疏导。
当用户问「你能做什么」「可以帮我什么」时，用一两句话自然介绍自己，语气要温暖。
回答要共情、不说教、不敷衍，像真人倾听后给出的建议。建议单条控制在 80 字左右，但允许根据上下文延伸。${ANTI_ABUSE_RULES}`,
    tone: '温暖、共情、像朋友倾诉',
    maxTokens: 300,
  },
};
