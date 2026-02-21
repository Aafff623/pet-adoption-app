import type { AgentType } from '../../types';

export type { AgentType };

export type AiAgentCategory = 'adoption' | 'care' | 'rescue' | 'growth';

export interface AiAgentConfig {
  id: AgentType;
  category: AiAgentCategory;
  name: string;
  avatar: string;
  icon: string;
  colorClass: string;
  description: string;
  systemPrompt: string;
  tone: string;
  maxTokens: number;
}

const ANTI_ABUSE_RULES = '防滥用：若用户连续发送相同内容、无意义字符、或明显刷屏，简短回复「请稍后再试～」即可，不要展开回答。';

const COMMON_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" rx="20" fill="%23f3f4f6"/%3E%3Ctext x="64" y="74" text-anchor="middle" font-size="44"%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E';

export const AI_AGENTS: Record<AgentType, AiAgentConfig> = {
  pet_expert: {
    id: 'pet_expert',
    category: 'adoption',
    name: '宠物专家',
    avatar: COMMON_AVATAR,
    icon: 'pets',
    colorClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    description: '领养与养宠咨询',
    systemPrompt: `你是宠物专家，提供养宠、领养、护理建议。${ANTI_ABUSE_RULES}`,
    tone: '专业、友好',
    maxTokens: 300,
  },
  emotional_counselor: {
    id: 'emotional_counselor',
    category: 'growth',
    name: '情感顾问',
    avatar: COMMON_AVATAR,
    icon: 'favorite',
    colorClass: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    description: '领养心理支持',
    systemPrompt: `你是情感顾问，提供共情与情绪支持。${ANTI_ABUSE_RULES}`,
    tone: '温暖、共情',
    maxTokens: 300,
  },
  adoption_advisor: {
    id: 'adoption_advisor',
    category: 'adoption',
    name: '领养顾问',
    avatar: COMMON_AVATAR,
    icon: 'assignment_turned_in',
    colorClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    description: '流程材料与风险提示',
    systemPrompt: `你是领养流程顾问，帮助用户完成领养准备与流程推进。${ANTI_ABUSE_RULES}`,
    tone: '清晰、可靠',
    maxTokens: 300,
  },
  behavior_trainer: {
    id: 'behavior_trainer',
    category: 'care',
    name: '行为训练师',
    avatar: COMMON_AVATAR,
    icon: 'sports_handball',
    colorClass: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    description: '习惯纠正与训练计划',
    systemPrompt: `你是行为训练师，提供可执行分步骤训练方案。${ANTI_ABUSE_RULES}`,
    tone: '结构化、鼓励式',
    maxTokens: 300,
  },
  medical_assistant: {
    id: 'medical_assistant',
    category: 'care',
    name: '医疗问诊助手',
    avatar: COMMON_AVATAR,
    icon: 'health_and_safety',
    colorClass: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    description: '症状分诊与就医建议',
    systemPrompt: `你是医疗问诊助手，可做分诊建议，不做确诊。急症必须建议就医。${ANTI_ABUSE_RULES}`,
    tone: '谨慎、安全优先',
    maxTokens: 280,
  },
  nutrition_coach: {
    id: 'nutrition_coach',
    category: 'care',
    name: '营养喂养师',
    avatar: COMMON_AVATAR,
    icon: 'restaurant',
    colorClass: 'bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400',
    description: '分龄饮食与体重管理',
    systemPrompt: `你是营养喂养师，根据年龄与体重给喂养建议。${ANTI_ABUSE_RULES}`,
    tone: '科学、耐心',
    maxTokens: 300,
  },
  rescue_coordinator: {
    id: 'rescue_coordinator',
    category: 'rescue',
    name: '救助协调员',
    avatar: COMMON_AVATAR,
    icon: 'volunteer_activism',
    colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    description: '救助任务拆解与协作',
    systemPrompt: `你是救助协调员，帮助拆解任务、安排协作与物资。${ANTI_ABUSE_RULES}`,
    tone: '高效、协作',
    maxTokens: 320,
  },
  newbie_guardian: {
    id: 'newbie_guardian',
    category: 'growth',
    name: '新手陪伴教练',
    avatar: COMMON_AVATAR,
    icon: 'school',
    colorClass: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
    description: '新手养宠陪伴计划',
    systemPrompt: `你是新手陪伴教练，提供前30天照护计划。${ANTI_ABUSE_RULES}`,
    tone: '陪伴型、循序渐进',
    maxTokens: 300,
  },
  health_advisor: {
    id: 'health_advisor',
    category: 'care',
    name: 'AI 健康顾问',
    avatar: COMMON_AVATAR,
    icon: 'medical_services',
    colorClass: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    description: '异常预警、健康咨询、居家护理、紧急转诊',
    systemPrompt: `你是宠物健康顾问，擅长：1) 基于健康日记分析异常并给出预警；2) 回答健康问题（如「它最近为什么频繁挠耳朵？」）做分诊建议，不做确诊；3) 提供居家护理指南；4) 紧急情况建议就医转诊。急症必须建议就医。${ANTI_ABUSE_RULES}`,
    tone: '专业、谨慎、安全优先',
    maxTokens: 400,
  },
};
