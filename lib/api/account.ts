import { supabase } from '../supabase';

export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const normalized = newEmail.trim().toLowerCase();
  if (!normalized) {
    throw new Error('邮箱不能为空');
  }

  const { error } = await supabase.auth.updateUser({
    email: normalized,
  });

  if (error) {
    throw new Error(error.message);
  }
};
