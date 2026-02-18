-- ============================================================
-- PetConnect 种子数据（除 pets 外的表）
-- 在 Supabase SQL Editor 中执行：先执行 schema.sql，再执行本文件
-- 依赖：auth.users 中至少有一个用户时，才会插入收藏/申请/会话/认证等数据
-- ============================================================

-- ============================================================
-- 1. feedback 意见反馈（匿名，无需用户）
-- ============================================================
INSERT INTO public.feedback (user_id, content, contact)
VALUES
  (NULL, '希望增加按城市筛选宠物的功能，方便同城领养。', 'user_feedback_1@example.com'),
  (NULL, '应用整体体验很好，建议领养流程再简化一些步骤。', ''),
  (NULL, '能否增加宠物健康档案的导出功能？', 'contact_wechat_123')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. favorites 收藏（为当前第一个用户添加两条收藏）
-- ============================================================
INSERT INTO public.favorites (user_id, pet_id)
SELECT u.id, p.id
FROM (SELECT id FROM auth.users LIMIT 1) u
CROSS JOIN (VALUES ('barnaby'), ('misty')) AS p(id)
WHERE NOT EXISTS (SELECT 1 FROM public.favorites f WHERE f.user_id = u.id AND f.pet_id = p.id);

-- ============================================================
-- 3. adoption_applications 领养申请（一条示例申请）
-- ============================================================
INSERT INTO public.adoption_applications (
  user_id, pet_id, full_name, age, occupation, housing_type, living_status, has_experience, message, status
)
SELECT
  u.id,
  'loki',
  '李领养',
  '28',
  '软件工程师',
  '自有住房',
  '独居',
  TRUE,
  '家里有养狗经验，有稳定收入和充足时间，希望给洛基一个家。',
  'pending'
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.adoption_applications a
  WHERE a.user_id = u.id AND a.pet_id = 'loki'
);

-- ============================================================
-- 4. conversations 会话（一条与“送养人”的会话）
-- ============================================================
INSERT INTO public.conversations (user_id, other_user_name, other_user_avatar, last_message, last_message_time, unread_count, is_system)
SELECT
  u.id,
  '张医生',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDgVPpxg8HIumU7EpauZP9ZlqirzBnKLdJFGK3sIDR54NKgoMvWdCpOnQkKZ8i9pqr-ZwirabrItbbt19Vsp_Ks7rywsrwksbIasOlJwu_nzBSwVNsNqNU-QjsRBwhhPM8QaaDUMMydnkQNIgx8i8vIvll48zgOHd8bQb75k7SbZ6Q_TY-_ic2MXjg2J04C-ZxWIQTqZSB2ovFoiPFZMYQSivk3XgoNPRSlgXwh6z0jYRNW1FiTPEJPxBeGSAmJTnizmRheXOoL44o',
  '好的，周末可以来看巴纳比~',
  NOW() - INTERVAL '1 hour',
  1,
  FALSE
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations c
  WHERE c.user_id = u.id AND c.other_user_name = '张医生'
);

-- ============================================================
-- 5. chat_messages 聊天消息（为上面创建的会话插入几条消息）
-- ============================================================
INSERT INTO public.chat_messages (conversation_id, content, is_self)
SELECT c.id, msg.content, msg.is_self
FROM (
  SELECT id FROM public.conversations
  WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
  ORDER BY created_at DESC
  LIMIT 1
) c
CROSS JOIN (
  VALUES
    ('你好，想了解一下巴纳比的情况~', TRUE),
    ('巴纳比很健康，已绝育，性格活泼。', FALSE),
    ('好的，周末可以来看巴纳比~', FALSE)
) AS msg(content, is_self)
WHERE c.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.conversation_id = c.id);

-- ============================================================
-- 6. verifications 实名认证（为第一个用户插入一条待审核认证）
-- ============================================================
INSERT INTO public.verifications (user_id, real_name, id_type, id_number, status)
SELECT
  u.id,
  '王实名',
  '居民身份证',
  '310101199001011234',
  'pending'
FROM (SELECT id FROM auth.users LIMIT 1) u
WHERE NOT EXISTS (SELECT 1 FROM public.verifications v WHERE v.user_id = u.id);

-- ============================================================
-- 说明
-- ============================================================
-- profiles 表由 handle_new_user() 在用户注册时自动创建，无需种子数据。
-- 若 auth.users 中尚无用户，仅 feedback 会有数据；在 Supabase 后台先创建至少一个测试用户后再执行本文件，即可为其余表补充数据。
-- 可多次执行本文件，重复插入会因唯一约束或 EXISTS 条件被跳过。
