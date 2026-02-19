import { supabase } from '../supabase';
import type { FollowUpTask } from '../../types';

const mapRowToFollowUpTask = (row: Record<string, unknown>): FollowUpTask => ({
  id: row.id as string,
  userId: row.user_id as string,
  petId: row.pet_id as string,
  title: row.title as string,
  templateKey: (row.template_key as string | null) ?? null,
  dueDate: row.due_date as string,
  status: row.status as FollowUpTask['status'],
  feedback: (row.feedback as string) ?? '',
  completedAt: (row.completed_at as string | null) ?? null,
  createdAt: row.created_at as string,
});

export const fetchFollowUpTasks = async (userId: string): Promise<FollowUpTask[]> => {
  const { data, error } = await supabase
    .from('follow_up_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true });

  if (error || !data) return [];
  return data.map(row => mapRowToFollowUpTask(row as Record<string, unknown>));
};

export const createFollowUpTask = async (params: {
  userId: string;
  petId: string;
  title: string;
  dueDate: string;
  templateKey?: string;
}): Promise<FollowUpTask> => {
  const { data, error } = await supabase
    .from('follow_up_tasks')
    .insert({
      user_id: params.userId,
      pet_id: params.petId,
      title: params.title,
      template_key: params.templateKey ?? null,
      due_date: params.dueDate,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '创建回访任务失败');
  }

  return mapRowToFollowUpTask(data as Record<string, unknown>);
};

export const ensureDefaultFollowUpTemplates = async (params: {
  userId: string;
  petId: string;
  petName: string;
  day7DueDate: string;
  day30DueDate: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('follow_up_tasks')
    .upsert(
      [
        {
          user_id: params.userId,
          pet_id: params.petId,
          title: `7天回访 · ${params.petName}`,
          template_key: 'day7',
          due_date: params.day7DueDate,
          status: 'pending',
        },
        {
          user_id: params.userId,
          pet_id: params.petId,
          title: `30天回访 · ${params.petName}`,
          template_key: 'day30',
          due_date: params.day30DueDate,
          status: 'pending',
        },
      ],
      {
        onConflict: 'user_id,pet_id,template_key',
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw new Error(error.message);
  }
};

export const completeFollowUpTask = async (params: {
  taskId: string;
  feedback: string;
}): Promise<FollowUpTask> => {
  const { data, error } = await supabase
    .from('follow_up_tasks')
    .update({
      status: 'completed',
      feedback: params.feedback,
      completed_at: new Date().toISOString(),
    })
    .eq('id', params.taskId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '完成回访任务失败');
  }

  return mapRowToFollowUpTask(data as Record<string, unknown>);
};
