import { supabase } from '../supabase';
import type { AdoptionApplication } from '../../types';

interface SubmitAdoptionParams {
  userId: string;
  petId: string;
  fullName: string;
  age: string;
  occupation: string;
  housingType: string;
  livingStatus: string;
  hasExperience: boolean;
  message: string;
}

export const submitAdoptionApplication = async (params: SubmitAdoptionParams): Promise<void> => {
  const { error } = await supabase.from('adoption_applications').insert({
    user_id: params.userId,
    pet_id: params.petId,
    full_name: params.fullName,
    age: params.age,
    occupation: params.occupation,
    housing_type: params.housingType,
    living_status: params.livingStatus,
    has_experience: params.hasExperience,
    message: params.message,
    status: 'pending',
  });

  if (error) throw new Error(error.message);
};

export const fetchMyApplications = async (userId: string): Promise<AdoptionApplication[]> => {
  const { data, error } = await supabase
    .from('adoption_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    fullName: row.full_name,
    age: row.age,
    occupation: row.occupation,
    housingType: row.housing_type,
    livingStatus: row.living_status,
    hasExperience: row.has_experience,
    message: row.message,
    status: row.status as AdoptionApplication['status'],
    createdAt: row.created_at,
  }));
};

export const fetchApplyingCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('adoption_applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) return 0;
  return count ?? 0;
};
