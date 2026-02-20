import { supabase } from '../supabase';
import type { PetHealthDiary, PetHealthInsight, HealthRiskLevel } from '../../types';

// ──────────── 数据库操作 ────────────

const mapInsightRow = (row: Record<string, unknown>): PetHealthInsight => ({
  id: row.id as string,
  petId: row.pet_id as string,
  userId: row.user_id as string,
  periodDays: row.period_days as number,
  insightSummary: row.insight_summary as string,
  riskLevel: row.risk_level as HealthRiskLevel,
  signals: (row.signals as string[]) ?? [],
  suggestions: (row.suggestions as string[]) ?? [],
  rawPayload: (row.raw_payload as Record<string, unknown>) ?? null,
  createdAt: row.created_at as string,
});

export const fetchLatestInsight = async (
  petId: string,
  userId: string,
  periodDays: number
): Promise<PetHealthInsight | null> => {
  const { data, error } = await supabase
    .from('pet_health_insights')
    .select('*')
    .eq('pet_id', petId)
    .eq('user_id', userId)
    .eq('period_days', periodDays)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapInsightRow(data as Record<string, unknown>);
};

const saveInsight = async (params: {
  petId: string;
  userId: string;
  periodDays: number;
  insightSummary: string;
  riskLevel: HealthRiskLevel;
  signals: string[];
  suggestions: string[];
  rawPayload: Record<string, unknown>;
}): Promise<PetHealthInsight> => {
  const { data, error } = await supabase
    .from('pet_health_insights')
    .insert({
      pet_id: params.petId,
      user_id: params.userId,
      period_days: params.periodDays,
      insight_summary: params.insightSummary,
      risk_level: params.riskLevel,
      signals: params.signals,
      suggestions: params.suggestions,
      raw_payload: params.rawPayload,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? '保存分析结果失败');
  return mapInsightRow(data as Record<string, unknown>);
};

// ──────────── AI 调用 ────────────

interface HealthInsightRaw {
  insight_summary: string;
  risk_level: 'low' | 'medium' | 'high';
  signals: string[];
  suggestions: string[];
}

function buildPrompt(entries: PetHealthDiary[], periodDays: number): string {
  const lines = entries.map((e, i) => {
    const parts: string[] = [];
    const date = new Date(e.recordedAt).toLocaleDateString('zh-CN');
    parts.push(`[${i + 1}] ${date}`);
    if (e.moodLevel != null) parts.push(`心情${e.moodLevel}/5`);
    if (e.appetiteLevel != null) parts.push(`食欲${e.appetiteLevel}/5`);
    if (e.energyLevel != null) parts.push(`活力${e.energyLevel}/5`);
    if (e.sleepHours != null) parts.push(`睡眠${e.sleepHours}h`);
    if (e.weightKg != null) parts.push(`体重${e.weightKg}kg`);
    if (e.symptoms) parts.push(`症状：${e.symptoms}`);
    if (e.note) parts.push(`备注：${e.note}`);
    return parts.join(' | ');
  });

  return `你是一名专业宠物健康顾问。以下是宠物最近 ${periodDays} 天的健康日记（共 ${entries.length} 条记录）：

${lines.join('\n')}

请分析上述数据，以 JSON 格式返回结果，字段如下：
- insight_summary: 简洁的综合健康评估（1-2句话，中文）
- risk_level: 风险等级，取值 "low" | "medium" | "high"
- signals: 观察到的异常信号，字符串数组（中文，每条 ≤30字，最多5条）
- suggestions: 给主人的建议，字符串数组（中文，每条 ≤40字，最多4条）

只返回合法 JSON，不要有任何额外说明文字。`;
}

async function callLlmRaw(prompt: string): Promise<string | null> {
  const provider = ((import.meta.env.VITE_LLM_PROVIDER as string) ?? '').toLowerCase().trim();

  if (provider === 'doubao') {
    const apiKey = ((import.meta.env.VITE_DOUBAO_API_KEY as string) ?? '').trim();
    const modelId = ((import.meta.env.VITE_DOUBAO_MODEL_ID as string) ?? '').trim();
    if (!apiKey || !modelId) return null;

    try {
      const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });
      if (!res.ok) return null;
      const d = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return d.choices?.[0]?.message?.content?.trim() ?? null;
    } catch { return null; }
  }

  if (provider === 'gemini') {
    const apiKey = ((import.meta.env.VITE_GEMINI_API_KEY as string) ?? '').trim();
    if (!apiKey) return null;
    const model = 'gemini-1.5-flash';

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
        }),
      });
      if (!res.ok) return null;
      const d = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
    } catch { return null; }
  }

  // default: deepseek
  const apiKey = ((import.meta.env.VITE_DEEPSEEK_API_KEY as string) ?? '').trim();
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return d.choices?.[0]?.message?.content?.trim() ?? null;
  } catch { return null; }
}

function parseInsightJson(raw: string): HealthInsightRaw | null {
  try {
    // 去掉可能的 markdown code fence
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as HealthInsightRaw;
    if (
      typeof parsed.insight_summary === 'string' &&
      ['low', 'medium', 'high'].includes(parsed.risk_level) &&
      Array.isArray(parsed.signals) &&
      Array.isArray(parsed.suggestions)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// ──────────── 降级规则引擎 ────────────

function ruleBasedInsight(entries: PetHealthDiary[], periodDays: number): HealthInsightRaw {
  if (entries.length === 0) {
    return {
      insight_summary: `最近 ${periodDays} 天暂无健康记录，建议定期记录宠物状态。`,
      risk_level: 'low',
      signals: [],
      suggestions: ['定期记录宠物的饮食和活力情况', '关注体重变化', '注意异常症状及时就医'],
    };
  }

  const signals: string[] = [];
  const suggestions: string[] = [];
  let riskScore = 0;

  const avgMood = entries.filter(e => e.moodLevel != null).reduce((s, e) => s + (e.moodLevel ?? 0), 0) / (entries.filter(e => e.moodLevel != null).length || 1);
  const avgAppetite = entries.filter(e => e.appetiteLevel != null).reduce((s, e) => s + (e.appetiteLevel ?? 0), 0) / (entries.filter(e => e.appetiteLevel != null).length || 1);
  const avgEnergy = entries.filter(e => e.energyLevel != null).reduce((s, e) => s + (e.energyLevel ?? 0), 0) / (entries.filter(e => e.energyLevel != null).length || 1);
  const symptomsEntries = entries.filter(e => e.symptoms && e.symptoms.trim());

  if (avgMood < 2.5 && entries.filter(e => e.moodLevel != null).length > 0) {
    signals.push('心情指数偏低，可能处于应激或不适状态');
    riskScore += 1;
    suggestions.push('增加与宠物的互动时间，提供安静舒适的环境');
  }
  if (avgAppetite < 2.5 && entries.filter(e => e.appetiteLevel != null).length > 0) {
    signals.push('食欲较差，需关注饮食状况');
    riskScore += 1;
    suggestions.push('检查食物是否变质，尝试更换品种，持续食欲差请就医');
  }
  if (avgEnergy < 2.5 && entries.filter(e => e.energyLevel != null).length > 0) {
    signals.push('活力不足，精神状态偏差');
    riskScore += 1;
    suggestions.push('适当增加户外活动，观察是否有其他不适症状');
  }
  if (symptomsEntries.length > 0) {
    signals.push(`近期有 ${symptomsEntries.length} 次出现症状记录`);
    riskScore += 2;
    suggestions.push('出现症状时建议尽快就医，不要自行用药');
  }

  const weights = entries.filter(e => e.weightKg != null).map(e => e.weightKg as number);
  if (weights.length >= 2) {
    const first = weights[weights.length - 1];
    const last = weights[0];
    const diff = Math.abs(last - first) / first;
    if (diff > 0.1) {
      signals.push(`体重在周期内变动超过 10%（${first.toFixed(1)}kg → ${last.toFixed(1)}kg）`);
      riskScore += 1;
      suggestions.push('体重明显变化建议咨询兽医，排除疾病风险');
    }
  }

  if (suggestions.length === 0) suggestions.push('整体状态良好，继续保持日常记录');

  const riskLevel: HealthRiskLevel = riskScore >= 3 ? 'high' : riskScore >= 1 ? 'medium' : 'low';
  const qualityText = riskLevel === 'low' ? '整体健康状况良好' : riskLevel === 'medium' ? '状态一般，需适当关注' : '健康风险较高，建议就医评估';
  const insightSummary = `最近 ${periodDays} 天（共 ${entries.length} 条记录），${qualityText}。`;

  return { insight_summary: insightSummary, risk_level: riskLevel, signals, suggestions };
}

// ──────────── 主入口 ────────────

export const generateHealthInsight = async (params: {
  petId: string;
  userId: string;
  periodDays: number;
  entries: PetHealthDiary[];
}): Promise<PetHealthInsight> => {
  const { petId, userId, periodDays, entries } = params;

  let parsed: HealthInsightRaw | null = null;
  let rawPayload: Record<string, unknown> = {};

  if (entries.length > 0) {
    const prompt = buildPrompt(entries, periodDays);
    const rawText = await callLlmRaw(prompt);
    if (rawText) {
      parsed = parseInsightJson(rawText);
      rawPayload = { raw: rawText };
    }
  }

  if (!parsed) {
    parsed = ruleBasedInsight(entries, periodDays);
    rawPayload = { fallback: true };
  }

  return saveInsight({
    petId,
    userId,
    periodDays,
    insightSummary: parsed.insight_summary,
    riskLevel: parsed.risk_level,
    signals: parsed.signals,
    suggestions: parsed.suggestions,
    rawPayload,
  });
};
