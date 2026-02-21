import { supabase } from '../supabase';

export interface CreateAdoptRequestParams {
  type: string;
  agePref?: string;
  city?: string;
  locationDetail?: string;
  contact?: string;
  imageUrl?: string;
}

/** Create a new adopt request (求领养) */
export const createAdoptRequest = async (params: CreateAdoptRequestParams, userId: string) => {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('adopt_requests')
    .insert({
      id,
      user_id: userId,
      type: params.type,
      age_pref: params.agePref ?? '',
      city: params.city ?? '',
      location_detail: params.locationDetail ?? '',
      contact: params.contact ?? '',
      image_url: params.imageUrl ?? '',
      status: 'open',
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? '创建求领养失败');
  return data;
};
