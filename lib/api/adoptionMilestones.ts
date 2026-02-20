import { supabase } from '../supabase';
import type { AdoptionMilestone, AdoptionMilestoneStage } from '../../types';

const STAGE_ORDER: AdoptionMilestoneStage[] = ['chatting', 'meet', 'trial', 'adopted'];

const mapRowToMilestone = (row: Record<string, unknown>): AdoptionMilestone => ({
  id: row.id as string,
  applicationId: row.application_id as string,
  petId: row.pet_id as string,
  adopterId: row.adopter_id as string,
  ownerId: row.owner_id as string,
  stage: row.stage as AdoptionMilestoneStage,
  status: row.status as AdoptionMilestone['status'],
  confirmedByAdopter: row.confirmed_by_adopter as boolean,
  confirmedByOwner: row.confirmed_by_owner as boolean,
  note: (row.note as string | null) ?? null,
  confirmedAt: (row.confirmed_at as string | null) ?? null,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

const buildDefaultMilestones = (params: {
  applicationId: string;
  petId: string;
  adopterId: string;
  ownerId: string;
}) => {
  return STAGE_ORDER.map(stage => ({
    application_id: params.applicationId,
    pet_id: params.petId,
    adopter_id: params.adopterId,
    owner_id: params.ownerId,
    stage,
    status: 'pending',
    confirmed_by_adopter: false,
    confirmed_by_owner: false,
  }));
};

export const fetchAdoptionMilestones = async (applicationId: string): Promise<AdoptionMilestone[]> => {
  const { data, error } = await supabase
    .from('adoption_milestones')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapRowToMilestone(row as Record<string, unknown>));
};

export const ensureAdoptionMilestones = async (params: {
  applicationId: string;
  petId: string;
  adopterId: string;
  ownerId: string;
}): Promise<AdoptionMilestone[]> => {
  const existing = await fetchAdoptionMilestones(params.applicationId);
  if (existing.length > 0) return existing;

  const { error } = await supabase
    .from('adoption_milestones')
    .insert(buildDefaultMilestones(params));

  if (error) throw new Error(error.message);

  return fetchAdoptionMilestones(params.applicationId);
};

export const confirmMilestone = async (params: {
  milestoneId: string;
  actorUserId: string;
  note?: string;
  confirmed: boolean;
}): Promise<AdoptionMilestone> => {
  const { data, error } = await supabase
    .from('adoption_milestones')
    .select('*')
    .eq('id', params.milestoneId)
    .single();

  if (error || !data) throw new Error(error?.message ?? '流程节点不存在');

  const milestone = mapRowToMilestone(data as Record<string, unknown>);
  const actorRole =
    params.actorUserId === milestone.adopterId
      ? 'adopter'
      : params.actorUserId === milestone.ownerId
      ? 'owner'
      : null;

  if (!actorRole) throw new Error('无权限确认该流程节点');

  const list = await fetchAdoptionMilestones(milestone.applicationId);
  const currentIndex = STAGE_ORDER.indexOf(milestone.stage);
  const previousMilestones = list.filter(item => STAGE_ORDER.indexOf(item.stage) < currentIndex);
  const hasIncompletePrevious = previousMilestones.some(item => item.status !== 'confirmed');
  if (hasIncompletePrevious) throw new Error('请按顺序推进流程，需先完成前置阶段确认');

  const confirmedByAdopter = actorRole === 'adopter' ? params.confirmed : milestone.confirmedByAdopter;
  const confirmedByOwner = actorRole === 'owner' ? params.confirmed : milestone.confirmedByOwner;
  const status: AdoptionMilestone['status'] =
    confirmedByAdopter && confirmedByOwner ? 'confirmed' : 'pending';

  const appendedNote = params.note?.trim()
    ? `${milestone.note ? `${milestone.note}\n` : ''}[${new Date().toLocaleString()}] ${
        actorRole === 'adopter' ? '领养人' : '送养人'
      }：${params.note.trim()}`
    : milestone.note;

  const confirmedAt =
    status === 'confirmed'
      ? milestone.confirmedAt ?? new Date().toISOString()
      : milestone.confirmedAt;

  const { data: updated, error: updateError } = await supabase
    .from('adoption_milestones')
    .update({
      confirmed_by_adopter: confirmedByAdopter,
      confirmed_by_owner: confirmedByOwner,
      status,
      note: appendedNote,
      confirmed_at: confirmedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.milestoneId)
    .select('*')
    .single();

  if (updateError || !updated) throw new Error(updateError?.message ?? '更新流程节点失败');
  return mapRowToMilestone(updated as Record<string, unknown>);
};
