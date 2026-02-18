import { supabase } from '../supabase';
import type { Conversation, ChatMessage } from '../../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const mapRowToConversation = (row: Record<string, unknown>): Conversation => ({
  id: row.id as string,
  userId: row.user_id as string,
  otherUserName: row.other_user_name as string,
  otherUserAvatar: row.other_user_avatar as string,
  lastMessage: row.last_message as string,
  lastMessageTime: row.last_message_time as string,
  unreadCount: row.unread_count as number,
  isSystem: row.is_system as boolean,
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

export const fetchTotalUnreadCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('unread_count')
    .eq('user_id', userId);

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + (row.unread_count ?? 0), 0);
};
