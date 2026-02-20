-- ============================================================
-- 为 chat_messages 添加软删除字段（回收站功能）
-- 在 Supabase SQL Editor 中执行本文件
-- ============================================================

-- 1. 添加 deleted_at 字段（软删除时间戳）
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. 添加 UPDATE 策略（软删除需要执行 UPDATE 操作）
DROP POLICY IF EXISTS "chat_messages_update_own" ON public.chat_messages;
CREATE POLICY "chat_messages_update_own" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
