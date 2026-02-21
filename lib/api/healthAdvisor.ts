/**
 * 生态六：AI 宠物健康顾问 API
 * 异常预警、多轮对话、居家护理指南、医院转诊匹配
 */
import { supabase } from '../supabase';
import { fetchHealthDiaries } from './healthDiary';
import { generateHealthInsight } from './healthInsights';
import { generateAgentReply } from './llm';
import type {
  HealthAlert,
  HealthAlertSeverity,
  HealthConsultationLog,
  PetHealthDiary,
} from '../../types';

// ──────────── 健康预警 ────────────

const mapAlertRow = (row: Record<string, unknown>): HealthAlert => ({
  id: row.id as string,
  petId: row.pet_id as string,
  userId: row.user_id as string,
  severity: row.severity as HealthAlertSeverity,
  title: row.title as string,
  message: row.message as string,
  sourceSnapshot: (row.source_snapshot as Record<string, unknown>) ?? null,
  readAt: (row.read_at as string) ?? null,
  createdAt: row.created_at as string,
});

/**
 * 基于健康日记生成异常预警
 * 调用 healthInsights 分析，若 risk_level 为 medium/high 则创建预警
 */
export async function generateHealthAlerts(params: {
  petId: string;
  userId: string;
  periodDays?: number;
}): Promise<HealthAlert[]> {
  const { petId, userId, periodDays = 14 } = params;
  const entries = await fetchHealthDiaries(petId, periodDays);
  if (entries.length === 0) return [];

  const insight = await generateHealthInsight({
    petId,
    userId,
    periodDays,
    entries,
  });

  if (insight.riskLevel === 'low') return [];

  const severity: HealthAlertSeverity = insight.riskLevel === 'high' ? 'high' : 'medium';
  const title =
    insight.riskLevel === 'high'
      ? '健康异常预警'
      : '健康状态需关注';
  const message = [insight.insightSummary, ...insight.signals, ...insight.suggestions].join('\n');

  const { data, error } = await supabase
    .from('health_alerts')
    .insert({
      pet_id: petId,
      user_id: userId,
      severity,
      title,
      message,
      source_snapshot: {
        insightId: insight.id,
        riskLevel: insight.riskLevel,
        signals: insight.signals,
        periodDays,
      },
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return [mapAlertRow(data as Record<string, unknown>)];
}

export async function fetchHealthAlerts(userId: string, limit = 50): Promise<HealthAlert[]> {
  const { data, error } = await supabase
    .from('health_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapAlertRow(row as Record<string, unknown>));
}

export async function markAlertRead(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('health_alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw new Error(error.message);
}

// ──────────── 咨询对话日志 ────────────

const mapLogRow = (row: Record<string, unknown>): HealthConsultationLog => ({
  id: row.id as string,
  userId: row.user_id as string,
  petId: (row.pet_id as string) ?? null,
  sessionId: row.session_id as string,
  role: row.role as 'user' | 'model',
  content: row.content as string,
  createdAt: row.created_at as string,
});

export async function fetchConsultationHistory(
  userId: string,
  sessionId: string
): Promise<HealthConsultationLog[]> {
  const { data, error } = await supabase
    .from('health_consultation_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapLogRow(row as Record<string, unknown>));
}

async function saveConsultationLog(params: {
  userId: string;
  petId: string | null;
  sessionId: string;
  role: 'user' | 'model';
  content: string;
}): Promise<HealthConsultationLog> {
  const { data, error } = await supabase
    .from('health_consultation_logs')
    .insert({
      user_id: params.userId,
      pet_id: params.petId ?? null,
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapLogRow(data as Record<string, unknown>);
}

// ──────────── 多轮对话智能体 ────────────

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

/**
 * 健康顾问多轮对话：发送用户消息，获取 AI 回复并持久化
 */
export async function sendHealthConsultation(params: {
  userId: string;
  petId: string | null;
  sessionId: string;
  userMessage: string;
  history: ChatTurn[];
}): Promise<{ reply: string; saved: boolean }> {
  const { userId, petId, sessionId, userMessage, history } = params;

  await saveConsultationLog({
    userId,
    petId,
    sessionId,
    role: 'user',
    content: userMessage,
  });

  const chatHistory: ChatTurn[] = history.map(h => ({ role: h.role, content: h.content }));
  const reply = await generateAgentReply('health_advisor', userMessage, chatHistory);

  const finalReply = reply ?? '抱歉，暂时无法回复，请稍后再试～';
  await saveConsultationLog({
    userId,
    petId,
    sessionId,
    role: 'model',
    content: finalReply,
  });

  return { reply: finalReply, saved: true };
}

// ──────────── 居家护理指南 ────────────

/**
 * 根据症状/问题生成居家护理指南
 * 复用 health_advisor Agent，传入结构化 prompt
 */
export async function generateCareGuide(params: {
  topic: string;
  petContext?: string;
  history?: ChatTurn[];
}): Promise<string> {
  const { topic, petContext = '', history = [] } = params;
  const prompt = petContext
    ? `请针对「${topic}」给出居家护理指南。宠物情况：${petContext}。要求：分步骤、可执行、每条不超过 50 字。`
    : `请针对「${topic}」给出居家护理指南。要求：分步骤、可执行、每条不超过 50 字。`;

  const reply = await generateAgentReply('health_advisor', prompt, history);
  return reply ?? '暂无护理建议，建议咨询兽医。';
}

// ──────────── 医院转诊匹配（MVP 简化） ────────────

/** MVP：返回预设的紧急就医提示，后续可接入真实医院数据 */
export async function matchEmergencyHospitals(params: {
  city?: string;
  symptom?: string;
}): Promise<{ tip: string; suggestions: string[] }> {
  const { city = '', symptom = '' } = params;
  const tip =
    city || symptom
      ? `建议在「${city || '您所在城市'}」搜索「宠物急诊」或「${symptom || '24小时宠物医院'}」，尽快就医。`
      : '紧急情况请立即前往就近的 24 小时宠物医院，或拨打当地宠物急救热线。';

  const suggestions = [
    '提前保存附近宠物医院联系方式',
    '紧急时可使用地图 App 搜索「宠物急诊」',
    '就医时带上近期健康记录',
  ];

  return { tip, suggestions };
}
