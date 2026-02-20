import { supabase } from '../supabase';
import type {
  AdoptionMatchScore,
  AllergyRiskLevel,
  MatchQuestionnaire,
  MatchScoreRaw,
} from '../../types';
import type { Pet } from '../../types';

// ============================================================
// 字段映射
// ============================================================
const mapRowToScore = (row: Record<string, unknown>): AdoptionMatchScore => ({
  id: row.id as string,
  userId: row.user_id as string,
  petId: row.pet_id as string,
  applicationId: (row.application_id as string | null) ?? null,
  overallScore: row.overall_score as number,
  stabilityScore: row.stability_score as number,
  timeScore: row.time_score as number,
  costScore: row.cost_score as number,
  experienceScore: row.experience_score as number,
  allergyRiskLevel: row.allergy_risk_level as AllergyRiskLevel,
  summary: row.summary as string,
  riskNotes: (row.risk_notes as string | null) ?? null,
  suggestions: (row.suggestions as string | null) ?? null,
  rawPayload: (row.raw_payload as Record<string, unknown> | null) ?? null,
  createdAt: row.created_at as string,
});

const clampScore = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

const toRawPayload = (raw: MatchScoreRaw, source: 'quick_local_v1' | 'ai_refined_v1'): Record<string, unknown> => ({
  source,
  ...raw,
});

const saveScoreRaw = async (
  raw: MatchScoreRaw,
  userId: string,
  petId: string,
  applicationId?: string,
  source: 'quick_local_v1' | 'ai_refined_v1' = 'ai_refined_v1'
): Promise<AdoptionMatchScore> => {
  const { data, error } = await supabase
    .from('adoption_match_scores')
    .insert({
      user_id: userId,
      pet_id: petId,
      application_id: applicationId ?? null,
      overall_score: clampScore(raw.overall_score),
      stability_score: clampScore(raw.stability_score),
      time_score: clampScore(raw.time_score),
      cost_score: clampScore(raw.cost_score),
      experience_score: clampScore(raw.experience_score),
      allergy_risk_level: raw.allergy_risk_level,
      summary: raw.summary,
      risk_notes: raw.risk_notes || null,
      suggestions: raw.suggestions || null,
      raw_payload: toRawPayload(raw, source),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToScore(data as Record<string, unknown>);
};

const buildQuickMatchScore = (
  pet: Pick<Pet, 'name' | 'breed' | 'category' | 'description'>,
  questionnaire: MatchQuestionnaire
): MatchScoreRaw => {
  let stability = 55;
  if (questionnaire.housingType.includes('自有')) stability += 20;
  if (questionnaire.livingStatus.includes('独居')) stability += 8;
  if (questionnaire.homeSize === '>100㎡') stability += 15;
  if (questionnaire.homeSize === '50-100㎡') stability += 8;

  let time = 40 + questionnaire.dailyFreeHours * 5;
  if (questionnaire.workStyle === '远程') time += 15;
  if (questionnaire.workStyle === '不规律') time -= 10;

  let cost = 45;
  if (questionnaire.monthlyBudget === '>1000') cost += 30;
  if (questionnaire.monthlyBudget === '500-1000') cost += 15;
  if (questionnaire.monthlyBudget === '<500') cost -= 5;

  let experience = questionnaire.hasExperience ? 80 : 55;
  if (questionnaire.hasOtherPets) experience += 6;

  const isHighAllergyPet = pet.category === 'cat' || pet.category === 'bird';
  let allergyRiskLevel: AllergyRiskLevel = 'low';
  if (questionnaire.hasAllergy && isHighAllergyPet) allergyRiskLevel = 'high';
  else if (questionnaire.hasAllergy) allergyRiskLevel = 'medium';

  const overall = clampScore(stability * 0.32 + time * 0.28 + cost * 0.22 + experience * 0.18);

  return {
    overall_score: overall,
    stability_score: clampScore(stability),
    time_score: clampScore(time),
    cost_score: clampScore(cost),
    experience_score: clampScore(experience),
    allergy_risk_level: allergyRiskLevel,
    summary: `已为你生成快速匹配评分（${overall} 分），AI 正在后台精修更详细分析。`,
    risk_notes: allergyRiskLevel !== 'low' ? '你填写了过敏相关信息，建议在接触前先做过敏评估。' : '',
    suggestions: '可继续完善寄语与生活安排，系统会在后台更新更精准的评分结果。',
  };
};

interface MatchScoreAsyncCallbacks {
  onRefined?: (score: AdoptionMatchScore) => void;
  onRefineError?: (error: Error) => void;
}

// ============================================================
// 查询
// ============================================================

/** 获取用户对某宠物的最新匹配评分（无则返回 null） */
export const fetchMatchScore = async (
  userId: string,
  petId: string
): Promise<AdoptionMatchScore | null> => {
  const { data, error } = await supabase
    .from('adoption_match_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRowToScore(data as Record<string, unknown>);
};

// ============================================================
// AI 评分生成（纯前端调用 LLM，不写 DB）
// ============================================================
const MATCH_SCORE_SYSTEM_PROMPT = `你是一名专业的宠物领养匹配顾问，根据申请人问卷和宠物信息，输出JSON格式的匹配评分。
规则：
1. overall_score = 四个维度分的加权平均，取整。
2. 过敏风险：hasAllergy=true 且 petType 为猫/鸟 时提升风险等级。
3. 若 message 字数 < 10 字，直接返回 {"error": "message_too_short"}。
4. 只输出合法 JSON，不添加任何说明文字、代码块标记。`;

const buildMatchPrompt = (pet: Pick<Pet, 'name' | 'breed' | 'category' | 'description'> & { category?: string }, questionnaire: MatchQuestionnaire): string => {
  return `
宠物信息：
- 名字：${pet.name}
- 品种：${pet.breed}
- 类型：${pet.category ?? '未知'}
- 描述：${pet.description ?? ''}

申请人问卷：
- 住房：${questionnaire.housingType}
- 居住状态：${questionnaire.livingStatus}
- 住宅面积：${questionnaire.homeSize}
- 养宠经验：${questionnaire.hasExperience ? '有' : '无'}
- 每日陪伴时间：${questionnaire.dailyFreeHours} 小时
- 每月预算：${questionnaire.monthlyBudget} 元
- 过敏史：${questionnaire.hasAllergy ? '有' : '无'}
- 其他宠物：${questionnaire.hasOtherPets ? '有' : '无'}
- 工作方式：${questionnaire.workStyle}
- 申请寄语：${questionnaire.message}

请输出如下JSON（字段不可增删）：
{
  "overall_score": <0-100 整数>,
  "stability_score": <0-100 整数，住房稳定性>,
  "time_score": <0-100 整数，时间投入>,
  "cost_score": <0-100 整数，经济能力>,
  "experience_score": <0-100 整数，经验准备度>,
  "allergy_risk_level": "<low|medium|high>",
  "summary": "<2-3句总体评价>",
  "risk_notes": "<风险提示，无则空字符串>",
  "suggestions": "<改进建议，无则空字符串>"
}`.trim();
};

/** 调用 LLM 生成匹配评分（不写库，返回原始结构） */
export const callLlmMatchScore = async (
  pet: Pick<Pet, 'name' | 'breed' | 'category' | 'description'>,
  questionnaire: MatchQuestionnaire
): Promise<MatchScoreRaw> => {
  // 输入质量检查
  if (questionnaire.message.trim().length < 10) {
    throw new Error('申请寄语至少需要 10 个字，才能生成 AI 评分');
  }

  const prompt = buildMatchPrompt(pet, questionnaire);

  // 动态选择 provider（复用环境变量逻辑）
  const provider = ((import.meta.env.VITE_LLM_PROVIDER as string) ?? '').toLowerCase().trim() || 'deepseek';

  let rawText: string | null = null;

  if (provider === 'gemini') {
    const apiKey = ((import.meta.env.VITE_GEMINI_API_KEY as string) ?? '').trim();
    if (!apiKey) throw new Error('未配置 Gemini API Key');
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: MATCH_SCORE_SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );
    if (!res.ok) throw new Error('Gemini API 请求失败');
    const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } else if (provider === 'doubao') {
    const apiKey = ((import.meta.env.VITE_DOUBAO_API_KEY as string) ?? '').trim();
    const modelId = ((import.meta.env.VITE_DOUBAO_MODEL_ID as string) ?? '').trim();
    if (!apiKey || !modelId) throw new Error('未配置 Doubao API Key / Model ID');
    const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: MATCH_SCORE_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 420,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error('Doubao API 请求失败');
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    rawText = data.choices?.[0]?.message?.content ?? null;
  } else {
    // deepseek (default)
    const apiKey = ((import.meta.env.VITE_DEEPSEEK_API_KEY as string) ?? '').trim();
    if (!apiKey) throw new Error('未配置 DeepSeek API Key');
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: MATCH_SCORE_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 420,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) throw new Error('DeepSeek API 请求失败');
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    rawText = data.choices?.[0]?.message?.content ?? null;
  }

  if (!rawText) throw new Error('AI 未返回有效结果');

  let parsed: Record<string, unknown>;
  try {
    // 清理可能的 markdown 代码块
    const cleaned = rawText.replace(/^```json\s*|```\s*$/g, '').trim();
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error('AI 返回格式异常，请重试');
  }

  if ((parsed as Record<string, unknown>).error === 'message_too_short') {
    throw new Error('申请寄语内容太短，无法生成有效评分，请详细描述');
  }

  return parsed as unknown as MatchScoreRaw;
};

// ============================================================
// 写入
// ============================================================

/** 生成评分并保存到数据库 */
export const generateAndSaveMatchScore = async (
  pet: Pick<Pet, 'name' | 'breed' | 'category' | 'description'>,
  questionnaire: MatchQuestionnaire,
  userId: string,
  petId: string,
  applicationId?: string,
  callbacks?: MatchScoreAsyncCallbacks
): Promise<AdoptionMatchScore> => {
  if (questionnaire.message.trim().length < 10) {
    throw new Error('申请寄语至少需要 10 个字，才能生成 AI 评分');
  }

  const quickRaw = buildQuickMatchScore(pet, questionnaire);
  const quickSaved = await saveScoreRaw(quickRaw, userId, petId, applicationId, 'quick_local_v1');

  void (async () => {
    try {
      const refinedRaw = await withTimeout(
        callLlmMatchScore(pet, questionnaire),
        25000,
        'AI 精修超时，请稍后重试'
      );
      const refinedScore = await saveScoreRaw(refinedRaw, userId, petId, applicationId, 'ai_refined_v1');
      callbacks?.onRefined?.(refinedScore);
    } catch (error) {
      callbacks?.onRefineError?.(error instanceof Error ? error : new Error('AI 精修失败'));
    }
  })();

  return quickSaved;
};
