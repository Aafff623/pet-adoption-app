-- ============================================================
-- Task 2: 消息数据模型升级
-- 支持真实 P2P 用户聊天：conversation 增 other_user_id，
-- chat_messages 增 sender_id，动态判断消息方向
-- ============================================================

-- 1. conversations 表增加 other_user_id（真实用户 ID）
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS other_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. chat_messages 表增加 sender_id（发送者真实 ID）
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. 为 P2P 会话创建唯一索引（防止重复创建双向会话）
CREATE UNIQUE INDEX IF NOT EXISTS conversations_p2p_unique
  ON public.conversations(user_id, other_user_id)
  WHERE other_user_id IS NOT NULL AND is_system = FALSE;

-- 4. sender_id 查询索引
CREATE INDEX IF NOT EXISTS chat_messages_sender_idx
  ON public.chat_messages(sender_id)
  WHERE sender_id IS NOT NULL;
