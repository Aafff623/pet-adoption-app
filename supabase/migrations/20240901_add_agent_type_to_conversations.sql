-- 为 conversations 添加 agent_type 列（AI 智能体会话区分）
-- 取值：null（寄养家庭）、pet_expert（宠物专家）、emotional_counselor（情感顾问）

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS agent_type TEXT DEFAULT NULL;
