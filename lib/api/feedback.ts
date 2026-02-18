import { supabase } from '../supabase';

export const submitFeedback = async (
  userId: string | null,
  content: string,
  contact: string
): Promise<void> => {
  const { error } = await supabase.from('feedback').insert({
    user_id: userId ?? null,
    content,
    contact,
  });

  if (error) throw new Error(error.message);
};
