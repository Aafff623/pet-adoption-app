import { supabase } from '../supabase';
import type { Conversation, ChatMessage, TrashedGroup, AgentType } from '../../types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { AI_AGENTS } from '../config/aiAgents';

const TRASH_RETENTION_DAYS = 3;

const mapRowToConversation = (row: Record<string, unknown>): Conversation => ({
  id: row.id as string,
  userId: row.user_id as string,
  otherUserName: row.other_user_name as string,
  otherUserAvatar: row.other_user_avatar as string,
  lastMessage: row.last_message as string,
  lastMessageTime: row.last_message_time as string,
  unreadCount: row.unread_count as number,
  isSystem: row.is_system as boolean,
  agentType: (row.agent_type as AgentType | null) ?? undefined,
  createdAt: row.created_at as string,
});

const mapRowToChatMessage = (row: Record<string, unknown>): ChatMessage => ({
  id: row.id as string,
  conversationId: row.conversation_id as string,
  content: row.content as string,
  isSelf: row.is_self as boolean,
  createdAt: row.created_at as string,
});

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_time', { ascending: false });

  if (error || !data) return [];
  return data.map(row => mapRowToConversation(row as Record<string, unknown>));
};

export const fetchChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(row => mapRowToChatMessage(row as Record<string, unknown>));
};

export const sendChatMessage = async (conversationId: string, content: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, content, is_self: true })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? '发送失败');

  await supabase
    .from('conversations')
    .update({ last_message: content, last_message_time: new Date().toISOString(), unread_count: 0 })
    .eq('id', conversationId);

  return mapRowToChatMessage(data as Record<string, unknown>);
};

export const insertSystemReply = async (conversationId: string, content: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, content, is_self: false })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? '插入回复失败');

  await supabase
    .from('conversations')
    .update({ last_message: content, last_message_time: new Date().toISOString(), unread_count: 1 })
    .eq('id', conversationId);

  return mapRowToChatMessage(data as Record<string, unknown>);
};

export const subscribeToMessages = (
  conversationId: string,
  onMessage: (msg: ChatMessage) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      payload => {
        onMessage(mapRowToChatMessage(payload.new as Record<string, unknown>));
      }
    )
    .subscribe();
  return channel;
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId);
};

const SYSTEM_CONV_OTHER_NAME = 'PetConnect 系统';

export const getOrCreateSystemConversation = async (userId: string): Promise<string> => {
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('is_system', true)
    .maybeSingle();

  if (!findError && existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      other_user_name: SYSTEM_CONV_OTHER_NAME,
      other_user_avatar: '',
      last_message: '',
      unread_count: 0,
      is_system: true,
    })
    .select('id')
    .single();

  if (createError || !created) throw new Error(createError?.message ?? '创建系统会话失败');
  return created.id as string;
};

export const getOrCreateAIConversation = async (
  userId: string,
  agentType: AgentType
): Promise<string> => {
  const config = AI_AGENTS[agentType];
  if (!config) throw new Error('未知的 AI 智能体类型');

  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('is_system', true)
    .eq('agent_type', agentType)
    .maybeSingle();

  if (!findError && existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      other_user_name: config.name,
      other_user_avatar: '',
      last_message: '',
      unread_count: 0,
      is_system: true,
      agent_type: agentType,
    })
    .select('id')
    .single();

  if (createError || !created) throw new Error(createError?.message ?? '创建 AI 会话失败');
  return created.id as string;
};

export const createOrFindConversation = async (
  userId: string,
  otherUserName: string,
  otherUserAvatar: string
): Promise<string> => {
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('other_user_name', otherUserName)
    .eq('is_system', false)
    .maybeSingle();

  if (!findError && existing) {
    return existing.id as string;
  }

  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      other_user_name: otherUserName,
      other_user_avatar: otherUserAvatar || null,
      last_message: '',
      unread_count: 0,
      is_system: false,
    })
    .select('id')
    .single();

  if (createError || !created) throw new Error(createError?.message ?? '创建会话失败');
  return created.id as string;
};

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await supabase.from('conversations').delete().eq('id', conversationId);
};

export const clearChatMessages = async (conversationId: string): Promise<void> => {
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('chat_messages')
    .update({ deleted_at: now })
    .eq('conversation_id', conversationId)
    .is('deleted_at', null);

  if (updateError) throw new Error(updateError.message);

  await supabase
    .from('conversations')
    .update({ last_message: '', last_message_time: now })
    .eq('id', conversationId);
};

export const fetchTrashedMessageGroups = async (userId: string): Promise<TrashedGroup[]> => {
  const { data: convData } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId);

  if (!convData || convData.length === 0) return [];

  const convMap = new Map(
    convData.map(c => [c.id as string, mapRowToConversation(c as Record<string, unknown>)])
  );

  const threeDaysAgo = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: trashed } = await supabase
    .from('chat_messages')
    .select('conversation_id, deleted_at')
    .in('conversation_id', Array.from(convMap.keys()))
    .not('deleted_at', 'is', null)
    .gte('deleted_at', threeDaysAgo)
    .order('deleted_at', { ascending: false });

  if (!trashed || trashed.length === 0) return [];

  const groups = new Map<string, { count: number; earliest: string }>();
  for (const row of trashed) {
    const convId = row.conversation_id as string;
    const deletedAt = row.deleted_at as string;
    if (!groups.has(convId)) {
      groups.set(convId, { count: 0, earliest: deletedAt });
    }
    const g = groups.get(convId)!;
    g.count += 1;
    if (deletedAt < g.earliest) g.earliest = deletedAt;
  }

  return Array.from(groups.entries())
    .filter(([convId]) => convMap.has(convId))
    .map(([convId, g]) => ({
      conversation: convMap.get(convId)!,
      messageCount: g.count,
      trashedAt: g.earliest,
      expiresAt: new Date(new Date(g.earliest).getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    }));
};

export const restoreTrashedMessages = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ deleted_at: null })
    .eq('conversation_id', conversationId)
    .not('deleted_at', 'is', null);

  if (error) throw new Error(error.message);

  const { data: latest } = await supabase
    .from('chat_messages')
    .select('content, created_at')
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest) {
    await supabase
      .from('conversations')
      .update({ last_message: latest.content, last_message_time: latest.created_at })
      .eq('id', conversationId);
  }
};

export const permanentlyDeleteMessages = async (conversationId: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('conversation_id', conversationId)
    .not('deleted_at', 'is', null);

  if (error) throw new Error(error.message);
};

export const fetchTotalUnreadCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('unread_count')
    .eq('user_id', userId);

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.unread_count ?? 0), 0);
};
