import { supabase } from '../supabase';
import { redeemPoints } from './points';
import { fetchHealthDiaries } from './healthDiary';
import { fetchLatestInsight } from './healthInsights';
import type {
  InsuranceProduct,
  InsurancePolicy,
  InsurancePolicyWithDetails,
  InsuranceClaim,
  CreateInsuranceClaimParams,
} from '../../types';

const mapProduct = (row: Record<string, unknown>): InsuranceProduct => ({
  id: row.id as string,
  name: row.name as string,
  description: row.description as string,
  coverageAmount: (row.coverage_amount as number) ?? 0,
  premiumYuan: (row.premium_yuan as number) ?? 0,
  pointsPerYuan: (row.points_per_yuan as number) ?? 10,
  category: (row.category as InsuranceProduct['category']) ?? 'all',
  minAgeMonths: (row.min_age_months as number) ?? 0,
  maxAgeMonths: (row.max_age_months as number | null) ?? null,
  isActive: (row.is_active as boolean) ?? true,
  sortOrder: (row.sort_order as number) ?? 0,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapPolicy = (row: Record<string, unknown>): InsurancePolicy => ({
  id: row.id as string,
  userId: row.user_id as string,
  petId: row.pet_id as string,
  productId: row.product_id as string,
  premiumYuan: (row.premium_yuan as number) ?? 0,
  pointsUsed: (row.points_used as number) ?? 0,
  pointsDiscountYuan: (row.points_discount_yuan as number) ?? 0,
  status: (row.status as InsurancePolicy['status']) ?? 'active',
  startAt: row.start_at as string,
  endAt: row.end_at as string,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const mapClaim = (row: Record<string, unknown>): InsuranceClaim => ({
  id: row.id as string,
  policyId: row.policy_id as string,
  userId: row.user_id as string,
  petId: row.pet_id as string,
  claimAmountYuan: (row.claim_amount_yuan as number) ?? 0,
  description: (row.description as string) ?? '',
  medicalImageUrl: (row.medical_image_url as string | null) ?? null,
  status: (row.status as InsuranceClaim['status']) ?? 'pending',
  rejectReason: (row.reject_reason as string | null) ?? null,
  reviewedAt: (row.reviewed_at as string | null) ?? null,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

/** 解析 age_text 为月数（近似） */
function parseAgeToMonths(ageText: string): number | null {
  if (!ageText || typeof ageText !== 'string') return null;
  const s = ageText.trim();
  const yearMatch = s.match(/(\d+)\s*岁/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;
  const monthMatch = s.match(/(\d+)\s*个?月/);
  if (monthMatch) return parseInt(monthMatch[1], 10);
  return null;
}

export const fetchInsuranceProducts = async (
  category?: InsuranceProduct['category']
): Promise<InsuranceProduct[]> => {
  let query = supabase
    .from('insurance_products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category && category !== 'all') {
    query = query.or(`category.eq.${category},category.eq.all`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapProduct(row as Record<string, unknown>));
};

export const fetchRecommendedProducts = async (params: {
  petId: string;
  petAgeText: string;
  petCategory?: string;
}): Promise<InsuranceProduct[]> => {
  const all = await fetchInsuranceProducts(
    (params.petCategory as InsuranceProduct['category']) ?? 'all'
  );
  const ageMonths = parseAgeToMonths(params.petAgeText);

  return all.filter(p => {
    if (ageMonths != null) {
      if (ageMonths < p.minAgeMonths) return false;
      if (p.maxAgeMonths != null && ageMonths > p.maxAgeMonths) return false;
    }
    return true;
  });
};

export const fetchProductById = async (id: string): Promise<InsuranceProduct | null> => {
  const { data, error } = await supabase
    .from('insurance_products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return mapProduct(data as Record<string, unknown>);
};

export interface PurchasePolicyParams {
  userId: string;
  petId: string;
  productId: string;
  pointsToUse?: number;
}

export const purchasePolicy = async (
  params: PurchasePolicyParams
): Promise<InsurancePolicy> => {
  const product = await fetchProductById(params.productId);
  if (!product) throw new Error('险种不存在或已下架');

  const pointsToUse = Math.max(0, params.pointsToUse ?? 0);
  const maxDiscountYuan = Math.floor(pointsToUse / product.pointsPerYuan);
  const discountYuan = Math.min(maxDiscountYuan, product.premiumYuan);
  const finalPremiumYuan = product.premiumYuan - discountYuan;
  const actualPointsUsed = discountYuan * product.pointsPerYuan;

  if (actualPointsUsed > 0) {
    await redeemPoints({
      itemKey: `insurance_premium:${params.productId}`,
      cost: actualPointsUsed,
    });
  }

  const startAt = new Date();
  const endAt = new Date();
  endAt.setFullYear(endAt.getFullYear() + 1);

  const { data, error } = await supabase
    .from('pet_insurance_policies')
    .insert({
      user_id: params.userId,
      pet_id: params.petId,
      product_id: params.productId,
      premium_yuan: finalPremiumYuan,
      points_used: actualPointsUsed,
      points_discount_yuan: discountYuan,
      status: 'active',
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? '投保失败');
  return mapPolicy(data as Record<string, unknown>);
};

export const fetchMyPolicies = async (
  userId: string
): Promise<InsurancePolicyWithDetails[]> => {
  const { data, error } = await supabase
    .from('pet_insurance_policies')
    .select(`
      *,
      insurance_products(name),
      pets(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(row => {
    const r = row as Record<string, unknown>;
    const policy = mapPolicy(r);
    const product = r.insurance_products as Record<string, unknown> | null;
    const pet = r.pets as Record<string, unknown> | null;
    return {
      ...policy,
      productName: product?.name as string | undefined,
      petName: pet?.name as string | undefined,
    };
  });
};

export const fetchPolicyById = async (
  id: string,
  userId: string
): Promise<InsurancePolicyWithDetails | null> => {
  const { data, error } = await supabase
    .from('pet_insurance_policies')
    .select(`
      *,
      insurance_products(name),
      pets(name)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  const r = data as Record<string, unknown>;
  const policy = mapPolicy(r);
  const product = r.insurance_products as Record<string, unknown> | null;
  const pet = r.pets as Record<string, unknown> | null;
  return {
    ...policy,
    productName: product?.name as string | undefined,
    petName: pet?.name as string | undefined,
  };
};

export const submitClaim = async (
  params: CreateInsuranceClaimParams,
  userId: string
): Promise<InsuranceClaim> => {
  const { data, error } = await supabase
    .from('insurance_claims')
    .insert({
      policy_id: params.policyId,
      user_id: userId,
      pet_id: params.petId,
      claim_amount_yuan: params.claimAmountYuan,
      description: params.description,
      medical_image_url: params.medicalImageUrl ?? null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? '提交理赔失败');
  return mapClaim(data as Record<string, unknown>);
};

export const fetchClaimsByPolicy = async (
  policyId: string,
  userId: string
): Promise<InsuranceClaim[]> => {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*')
    .eq('policy_id', policyId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapClaim(row as Record<string, unknown>));
};

export const fetchMyClaims = async (userId: string): Promise<InsuranceClaim[]> => {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapClaim(row as Record<string, unknown>));
};

/** 健康日记风控：读取最近记录用于理赔评估（只读，不修改） */
export const getHealthDiaryRiskHint = async (
  petId: string,
  limitDays = 90
): Promise<{ hasRecords: boolean; symptomCount: number }> => {
  const diaries = await fetchHealthDiaries(petId, limitDays);
  const symptomCount = diaries.filter(d => d.symptoms && d.symptoms.trim()).length;
  return { hasRecords: diaries.length > 0, symptomCount };
};

/** 健康趋势（可选）：读取 AI 洞察用于险种推荐 */
export const getHealthInsightForRecommendation = async (
  petId: string,
  userId: string,
  periodDays = 30
): Promise<{ riskLevel?: string } | null> => {
  try {
    const insight = await fetchLatestInsight(petId, userId, periodDays);
    return insight ? { riskLevel: insight.riskLevel } : null;
  } catch {
    return null;
  }
};
