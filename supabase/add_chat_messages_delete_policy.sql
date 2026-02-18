-- ============================================================
-- 为 chat_messages 添加 DELETE 策略（清空聊天记录功能所需）
-- 若已执行过完整 schema.sql，只需在 Supabase SQL Editor 中执行本文件
-- ============================================================
DROP POLICY IF EXISTS "chat_messages_delete_own" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_own" ON public.chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
