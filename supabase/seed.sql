-- ============================================================
-- PetConnect 种子数据（除 pets 外的表）
-- 在 Supabase SQL Editor 中执行：先执行 schema.sql，再执行本文件
-- 依赖：auth.users 中至少有一个用户时，才会插入收藏/申请/会话/认证等数据
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

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
-- 7. lost_pet_alerts 应急广播（threetwoa-assistant 发布）
-- ============================================================
INSERT INTO public.lost_pet_alerts (
  user_id, pet_name, pet_type, pet_breed, pet_color, pet_gender, pet_age_text,
  avatar_url, description, lost_at, last_seen_at,
  location_text, latitude, longitude, radius_km,
  reward_text, contact_note, status, is_urgent
)
SELECT
  u.id,
  v.pet_name, v.pet_type, v.pet_breed, v.pet_color, v.pet_gender, v.pet_age_text,
  v.avatar_url, v.description, v.lost_at, v.last_seen_at,
  v.location_text, v.latitude, v.longitude, v.radius_km,
  v.reward_text, v.contact_note, v.status, v.is_urgent
FROM
  (SELECT id FROM auth.users WHERE email = '1012512411@qq.com' LIMIT 1) u,
  (VALUES
    (
      '小黄', 'dog', '金毛', '金黄色', 'male', '2 岁',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
      '我的金毛小黄于2月19日傍晚6点在静安寺地铁站附近走失，脖子上有蓝色项圈，项圈上有"小黄"刻字。它非常亲人，见人就摇尾巴，请好心人不要驱赶。发现后请原地等待或带至附近宠物医院扫芯片。',
      NOW() - INTERVAL '18 hours',
      NOW() - INTERVAL '17 hours',
      '上海市静安区静安寺地铁站附近', 31.2248, 121.4471, 5,
      '寻回奖励 500 元，感恩！',
      '微信同号：1012512411，或直接拨打电话，24小时在线',
      'active', TRUE
    ),
    (
      '橘猫团子', 'cat', '橘猫', '橘色白肚', 'male', '3 岁',
      'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=400&fit=crop',
      '团子是一只极其黏人的橘猫，从未独自出过门，2月18日下午因维修工人开门时趁机溜出，至今未归。它见到陌生人会躲但不攻击，饿了会主动找人，可能藏在附近停车场或绿化带。',
      NOW() - INTERVAL '42 hours',
      NOW() - INTERVAL '40 hours',
      '上海市徐汇区漕溪北路小区附近', 31.1940, 121.4370, 3,
      '寻回奖励 300 元',
      '请联系微信：threetwoa，或留言QQ：1012512411',
      'active', FALSE
    ),
    (
      '布偶猫露西', 'cat', '布偶猫', '双色（蓝白）', 'female', '1.5 岁',
      'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=400&h=400&fit=crop',
      '露西是一只未绝育的蓝白布偶，昨日午夜从浦东新区家里阳台走失，怀疑被人带走或自行跑到楼道躲避。她有芯片，扫描可查到主人联系方式。请各宠物医院、救助站留意，发现及时联系。',
      NOW() - INTERVAL '20 hours',
      NULL,
      '上海市浦东新区世纪大道附近小区', 31.2396, 121.5015, 8,
      '寻回奖励 800 元，布偶原价 1500 元',
      '急！请联系QQ：1012512411，随时接听',
      'active', TRUE
    )
  ) AS v(pet_name, pet_type, pet_breed, pet_color, pet_gender, pet_age_text,
         avatar_url, description, lost_at, last_seen_at,
         location_text, latitude, longitude, radius_km,
         reward_text, contact_note, status, is_urgent)
WHERE u.id IS NOT NULL;

-- ============================================================
-- 8. rescue_tasks 救助任务（threetwoa-assistant 发布）
-- ============================================================
INSERT INTO public.rescue_tasks (
  creator_id, title, task_type, description,
  location_text, latitude, longitude,
  window_start, window_end, status, max_assignees
)
SELECT
  u.id,
  v.title, v.task_type, v.description,
  v.location_text, v.latitude, v.longitude,
  v.window_start, v.window_end, 'open', v.max_assignees
FROM
  (SELECT id FROM auth.users WHERE email = '1012512411@qq.com' LIMIT 1) u,
  (VALUES
    (
      '紧急！流浪猫群喂食志愿者招募',
      'feeding',
      '静安区武定路一带有约 15 只流浪猫固定猫点，原负责人出差无人接手，需要志愿者每天早7点或晚6点喂食一次。猫粮由本人提供，只需定点投喂并拍照记录即可，适合附近上班族顺路帮忙。',
      '上海市静安区武定路近胶州路路口', 31.2310, 121.4560,
      NOW() + INTERVAL '2 hours',
      NOW() + INTERVAL '6 days 23 hours',
      2
    ),
    (
      '受伤流浪犬需紧急送医',
      'medical',
      '浦东新区世纪公园附近发现一只疑似被车撞伤的流浪中华田园犬，右后腿骨折无法站立，目前蜷缩在公园东门绿化带内。需要有私家车的志愿者协助送至最近的24小时宠物医院，医疗费用由本人承担，需要人手保定和运输。',
      '上海市浦东新区世纪公园东门绿化带', 31.2178, 121.5438,
      NOW() + INTERVAL '30 minutes',
      NOW() + INTERVAL '4 hours',
      2
    ),
    (
      '短期寄养：2只兔子需要代养7天',
      'foster',
      '因突发出差，家中两只荷兰矮耳兔（1公1母，已绝育）需要7天的寄养照料。兔子温顺不咬人，笼子和兔粮自带，每天只需喂食、换水、清理兔砂即可。有宠物饲养经验者优先，上门或接回均可协商。',
      '上海市徐汇区漕溪北路（可上门交接）', 31.1952, 121.4355,
      NOW() + INTERVAL '3 hours',
      NOW() + INTERVAL '1 day',
      1
    ),
    (
      '猫咪救助物资转运（嘉定→静安）',
      'transport',
      '嘉定区爱心救助站有一批捐赠物资（猫粮6袋约30kg、猫砂4袋、笼子2个）需要转运至静安区的救助驿站，当日完成即可。有SUV或货运能力的志愿者可报名，协助装卸并运输，油费可报销。',
      '上海市嘉定区嘉定镇街道（具体地址私信）', 31.3748, 121.2452,
      NOW() + INTERVAL '1 day',
      NOW() + INTERVAL '1 day 8 hours',
      1
    ),
    (
      '救助站紧急募集猫粮猫砂',
      'supplies',
      '本站目前收容流浪猫 23 只，存量猫粮仅剩 3 天用量，猫砂告急。急需爱心人士捐赠或采购：成猫粮（全价干粮）20kg 以上，猫砂（豆腐砂或膨润土）10包以上。可送至徐汇区驿站，或联系本人上门取件，每份捐赠都将拍照公示。',
      '上海市徐汇区流浪猫救助驿站（私信获取地址）', 31.2012, 121.4465,
      NOW(),
      NOW() + INTERVAL '3 days',
      5
    )
  ) AS v(title, task_type, description, location_text, latitude, longitude, window_start, window_end, max_assignees)
WHERE u.id IS NOT NULL;

-- ============================================================
-- 9. profiles 回填（确保 auth.users 注册账号在 profiles 中可见）
-- ============================================================
INSERT INTO public.profiles (id, nickname, avatar_url, bio, city)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'nickname', ''), split_part(u.email, '@', 1), '宠物爱好者'),
  COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
  '',
  ''
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- ============================================================
-- 10. profiles 用户资料补充（为前 4 个测试账号补充昵称与画像）
-- ============================================================
UPDATE public.profiles p
SET
  nickname = v.nickname,
  avatar_url = v.avatar_url,
  bio = v.bio,
  city = v.city,
  following_count = v.following_count,
  applying_count = v.applying_count,
  adopted_count = v.adopted_count,
  updated_at = NOW()
FROM (
  SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.created_at ASC) AS rn
  FROM auth.users u
  LIMIT 4
) tu
JOIN (
  VALUES
    (1, '喵星观察员-安安', 'https://picsum.photos/seed/profile1/200/200', '擅长幼猫照护与行为引导，周末常做救助志愿服务。', '上海市', 26, 3, 1),
    (2, '遛狗达人-阿杰', 'https://picsum.photos/seed/profile2/200/200', '每日遛狗两次，偏好中大型犬，愿意长期回访。', '杭州市', 18, 2, 2),
    (3, '新手家长-小雨', 'https://picsum.photos/seed/profile3/200/200', '第一次领养前持续学习中，已完成新人养宠课程。', '南京市', 9, 1, 0),
    (4, '救助站值班员-木子', 'https://picsum.photos/seed/profile4/200/200', '负责站内医疗登记与物资盘点，欢迎同城协作。', '苏州市', 33, 4, 3)
) AS v(rn, nickname, avatar_url, bio, city, following_count, applying_count, adopted_count)
  ON v.rn = tu.rn
WHERE p.id = tu.id
  AND (p.nickname = '宠物爱好者' OR p.nickname = '' OR p.nickname IS NULL);

-- ============================================================
-- 11. adoption_applications 更多测试申请
-- ============================================================
INSERT INTO public.adoption_applications (
  user_id, pet_id, full_name, age, occupation, housing_type, living_status, has_experience, message, status
)
SELECT
  u.id,
  pet_id,
  full_name,
  age,
  occupation,
  housing_type,
  living_status,
  has_experience,
  message,
  status
FROM (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) u
CROSS JOIN (
  VALUES
    ('barnaby', '赵一鸣', '31', '产品经理', '自有住房', '与伴侣同住', TRUE, '有稳定作息和固定遛狗时间，希望领养巴纳比。', 'pending'),
    ('misty', '林可可', '26', '插画师', '租房（可养宠）', '独居', TRUE, '家里已有完善猫爬架和隔离空间，愿意定期回访。', 'approved'),
    ('loki', '周明', '29', '测试工程师', '自有住房', '与父母同住', FALSE, '刚开始学习养宠，但家庭支持且有时间投入。', 'pending')
) AS s(pet_id, full_name, age, occupation, housing_type, living_status, has_experience, message, status)
WHERE EXISTS (SELECT 1 FROM public.pets p WHERE p.id = s.pet_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.adoption_applications a
    WHERE a.user_id = u.id
      AND a.pet_id = s.pet_id
  );

-- ============================================================
-- 12. conversations + chat_messages 扩充交互聊天样本
-- ============================================================
INSERT INTO public.conversations (
  user_id, other_user_name, other_user_avatar, last_message, last_message_time, unread_count, is_system
)
SELECT
  u.id,
  s.other_user_name,
  s.other_user_avatar,
  s.last_message,
  NOW() - s.last_message_offset,
  s.unread_count,
  FALSE
FROM (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) u
CROSS JOIN (
  VALUES
    ('王护士', 'https://picsum.photos/seed/chat1/120/120', '今晚已帮你确认疫苗记录，明天可安排见面。', INTERVAL '35 minutes', 2),
    ('陈志愿者', 'https://picsum.photos/seed/chat2/120/120', '我可以周六陪同家访，时间你来定。', INTERVAL '2 hours', 1),
    ('领养顾问小夏', 'https://picsum.photos/seed/chat3/120/120', '你的资料很完整，进入最终审核阶段。', INTERVAL '1 day 3 hours', 0),
    ('系统通知', '', '你有一条新的领养进度提醒。', INTERVAL '20 minutes', 1)
) AS s(other_user_name, other_user_avatar, last_message, last_message_offset, unread_count)
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations c
  WHERE c.user_id = u.id
    AND c.other_user_name = s.other_user_name
);

INSERT INTO public.chat_messages (conversation_id, content, is_self)
SELECT c.id, m.content, m.is_self
FROM public.conversations c
JOIN (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) u ON u.id = c.user_id
JOIN (
  VALUES
    ('王护士', '你好，我想确认一下巴纳比近期体检情况。', TRUE),
    ('王护士', '好的，最近一次体检在上周，指标都正常。', FALSE),
    ('王护士', '今晚已帮你确认疫苗记录，明天可安排见面。', FALSE),

    ('陈志愿者', '周末家访需要准备哪些材料？', TRUE),
    ('陈志愿者', '身份证明和居住证明即可，我会提前一天提醒你。', FALSE),
    ('陈志愿者', '我可以周六陪同家访，时间你来定。', FALSE),

    ('领养顾问小夏', '我已提交了补充说明，请帮忙查看。', TRUE),
    ('领养顾问小夏', '收到，资料齐全，正在走最终复核。', FALSE),
    ('领养顾问小夏', '你的资料很完整，进入最终审核阶段。', FALSE),

    ('系统通知', '你有一条新的领养进度提醒。', FALSE),
    ('系统通知', '点击「领养进度」可查看下一步任务。', FALSE)
) AS m(other_user_name, content, is_self)
  ON m.other_user_name = c.other_user_name
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_messages x
  WHERE x.conversation_id = c.id
    AND x.content = m.content
);

-- ============================================================
-- 说明
-- ============================================================
-- profiles 表由 handle_new_user() 在用户注册时自动创建，无需种子数据。
-- 若 auth.users 中尚无用户，仅 feedback 会有数据；在 Supabase 后台先创建至少一个测试用户后再执行本文件，即可为其余表补充数据。
-- 可多次执行本文件，重复插入会因唯一约束或 EXISTS 条件被跳过。
