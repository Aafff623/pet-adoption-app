-- ============================================================
-- PetConnect 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件以初始化数据库
-- ============================================================

-- ============================================================
-- 1. profiles 用户资料表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '宠物爱好者',
  avatar_url TEXT DEFAULT '',
  following_count INTEGER NOT NULL DEFAULT 0,
  applying_count INTEGER NOT NULL DEFAULT 0,
  adopted_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '宠物爱好者'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. pets 宠物信息表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_text TEXT NOT NULL,
  distance TEXT NOT NULL DEFAULT '未知',
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  image_url TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  story TEXT NOT NULL DEFAULT '',
  health JSONB NOT NULL DEFAULT '{}',
  foster_parent_name TEXT NOT NULL DEFAULT '',
  foster_parent_avatar TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'all' CHECK (category IN ('all', 'dog', 'cat', 'rabbit', 'bird', 'other')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select_all" ON public.pets
  FOR SELECT USING (true);

-- ============================================================
-- 3. favorites 收藏表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. adoption_applications 领养申请表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age TEXT NOT NULL,
  occupation TEXT NOT NULL,
  housing_type TEXT NOT NULL,
  living_status TEXT NOT NULL,
  has_experience BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_own" ON public.adoption_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "applications_insert_own" ON public.adoption_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. conversations 会话表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_name TEXT NOT NULL,
  other_user_avatar TEXT NOT NULL DEFAULT '',
  last_message TEXT NOT NULL DEFAULT '',
  last_message_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 6. chat_messages 聊天消息表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_self BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_own" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. verifications 实名认证表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  real_name TEXT NOT NULL,
  id_type TEXT NOT NULL DEFAULT '居民身份证',
  id_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_select_own" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "verifications_update_own" ON public.verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 8. feedback 意见反馈表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_own" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "feedback_select_own" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 9. 初始宠物数据（种子数据）
-- ============================================================
INSERT INTO public.pets (id, name, breed, age_text, distance, gender, image_url, price, location, weight, description, is_urgent, story, health, foster_parent_name, foster_parent_avatar, category)
VALUES
(
  'barnaby', '巴纳比', '比格犬', '2 岁', '2.5 公里', 'male',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDd8gze_FbFR8b9nFnJNyOBvi8n2pH4no0g_zJ1k2Aw6qqvK5qhU8YoiqjxSP3gvgkv1FBd0NEdo0f_qnDB__yP61rj-5YbYCKHADWzPfEBgBxQLb_1MAmoZVypHJtkLPdotuG1fiITFIp4SPSEUzcYYRhmlzhFj7qeKlS66YNBjvvGrB2e8BMmeifJjofOdoZFEitzggIprTp0z8QFf55Z5wZe-kFmlj0oiX6pBwzyVj8BJlVdJ1UYDmboQb0muaa-_NBVISrZulqI',
  500, '上海市静安区', '12 Kg', '巴纳比是一只充满活力的比格犬，嗅觉灵敏，性格开朗。',
  TRUE,
  '巴纳比是我们从一个关闭的繁殖场救助出来的。虽然前半生比较艰难，但他依然对人类充满了信任和爱。他特别喜欢户外活动，需要一个能经常带他散步的主人。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "基础训练"}',
  '张医生',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDgVPpxg8HIumU7EpauZP9ZlqirzBnKLdJFGK3sIDR54NKgoMvWdCpOnQkKZ8i9pqr-ZwirabrItbbt19Vsp_Ks7rywsrwksbIasOlJwu_nzBSwVNsNqNU-QjsRBwhhPM8QaaDUMMydnkQNIgx8i8vIvll48zgOHd8bQb75k7SbZ6Q_TY-_ic2MXjg2J04C-ZxWIQTqZSB2ovFoiPFZMYQSivk3XgoNPRSlgXwh6z0jYRNW1FiTPEJPxBeGSAmJTnizmRheXOoL44o',
  'dog'
),
(
  'misty', '米斯蒂', '虎斑猫', '4 个月', '1.2 公里', 'female',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCnNyWWqfayP1GgoxDLIagfEmeZpxpSLxyRczO5g2dEhb1Y2WU3CqfXgBG0sPuT6IsImFWOs8FXEsNO3E6sMcyiNUqgdtcKHbMm6GT_dYZzB8PNAYnsuMmMpRVJ0bXKPfMJVVo2Lp52fzmMi2zAAykB-xhAet5KgBlH5tDcf6R5o4FXEc7_rrzlEvdCGWqv-JqFLWz7Fd0e2BMg39xz2OXzBwE-I3_qI2CgoURwotKKGDxYIRAQphIRi_nSQkGJWC_ox-TARYfcQ_M',
  200, '上海市黄浦区', '2.5 Kg', '米斯蒂是一只害羞但温柔的小猫。',
  FALSE,
  '米斯蒂是在暴雨天被发现在车底下的。她现在非常健康，喜欢玩逗猫棒，希望能找一个安静温暖的家。',
  '{"vaccines": "第一针", "neuter": "未绝育", "chip": "未注册", "training": "会用猫砂"}',
  '王阿姨',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmMrcfJyvmWq2f5POlSJWVrfw-9KNg547O1zLwC_giy9H7xKmjt07WYCse6tuVmlgUkoaIDPjt-vVhkBuF3BypTzcm-0pncSBcY98BnlWhqREqJYI3noZpdcYhlTp-wOaUNB3ht2TFx_XdrFe6FD-muNyni4oATKVG0P8pC0C4Q8IUbWBcV7LAFHCrHeRE1L3flJ-r1enfIvHFNfRBh9AQYjvhCkuWuNdAmViSofN2JvGOBwC7Kxe5RoxN93VcRqTejRIdx4ulOm0',
  'cat'
),
(
  'loki', '洛基', '混血犬', '3 岁', '5 公里', 'male',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDyoly3o-HDa495YtgbRAZC-DUAjSNunRIHui8CrO8Jfg-67GJXjzA0iRdVvv7MEYrOy9rNqPSWIXCO6jHy-2cr4Sgn5rKLmjV7klXPoJFL4-_JbzTX-V-QMgiIqR8LSuMJLQp2pq1aJN3cGKm9ODrfeQN0YKyYH8-Tts7KNu7KEBjtOKsxTQ1vj-7KsLb0PhEkFaIdDkz-jT9gXaG5BzBt2ZGBA9WVuj9dwxm4P1g4Q0xuEAOhpOAfq7VXRTX4p1v9I0xrX-AGFys',
  0, '上海市闵行区', '18 Kg', '洛基是一只聪明且忠诚的伙伴。',
  FALSE,
  '洛基因为原主人搬家而被遗弃。他受过良好的训练，会握手、坐下等指令。他对人非常友善，很适合有大孩子的家庭。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "高级指令"}',
  '陈教练',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuClcJ1kGSejxdskDILVxhF1567_vIwNfhM3gcP6seQ8Lbd1W1W6sUL5ikTIseOuweE2Ve_y3g6xH-xlcrMsnN93yy66WF73_YpdBvJUgWJRHX0UGeLwU_J-aL8PaSkrAdJ_6MDpAwFgZJ7Iaj4pmpOzK3FnDLAEEswV75fVEkLyaU9kDH7Y27M8y37lItAq6WqhETeZdkMPZug5jCwCWh9wr3xsOO-4sv9QaP0iXuDyjwPOO2v6Y1khyFOr5ZETMBJFfa3ddu8Y5Wo',
  'dog'
),
(
  'oreo', '奥利奥', '兔子', '1 岁', '800 米', 'male',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnJi9iaykKdohg7fHpgDWu4KY8RPG6SyDwUls-nuFJpu38VJpayP-YxepNnXrf8vIU83Q1bV1eJL_IzKZfE9Sxz-LxBj9bVZd3eu-rk3-3V8mz7MNQrpnyeA_k1p4jN772gqcLzSL8AJ9FeC0xBNQQXbXXLMfnri9MC1UqcmSDqllTSrkvBZjlc232DNWtMmZ6t0IGhJER94kmnYSvKqcvKc9b3uuNfW-1nB1NyCYm8MdjGnX1sFClevTSPOFvBNPXxSUaH4y3wG8',
  80, '上海市徐汇区', '1.5 Kg', '奥利奥是一只黑白相间的侏儒兔。',
  FALSE,
  '奥利奥喜欢吃胡萝卜叶子，性格比较独立，但也喜欢被轻轻抚摸耳朵。需要注意家里电线的收纳哦。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  'Lisa',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDorhYGu9SF5uyTjjc6bDH8TOer8nKZdWo8tg0-px8a1iTeKeo4VajYdgvR_R-UaoF4iTNdIlALu-Vio5txHrqOFdR_VNncoAxj_K3gNs29_Ph9MdsosHynjBlCdiXjyQjP2YSXGphbx-IQHKNpNeV5FCyryG_4zJ5-Lz42mo--EtABfPxeFDG2U54VsoSrx1cNr57sIOlrVLzVXCue49Xbmjdj3qqA36X5gvg1A3-LbNUUOyix8OJcvEsZXl5EtgYZCGiZ312bPAI',
  'rabbit'
),
(
  'daisy', '戴西', '金毛', '6 个月', '3.5 公里', 'female',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBCkU61rSmnjutmCrsbw4HL4dLoYNxu_xnKeDkqPqkyiu_NwlS2ntXZEQ1yRnNi1mVKNEpqn1EaS6OZ_I1jkXH4Xh-S8jUjgBrpSdeNv7c7UMfr1sjgOLNydQ4iRMThPx8UKWwdG2ibTpooI3A9tPysSrbf8kqW6Cdke6Nb9K-JL31oSxrFRqZmf8JE-0OHw3YLwitRBSKLRVDiNyDP_YeI1dkJSfjZyH_9vV2C2lwb_XikvKZf7tdI5Jsw3UPC2UJbNTAGfteKgGI',
  800, '上海市浦东新区', '15 Kg', '戴西是人见人爱的小天使。',
  FALSE,
  '戴西是一只性格极好的金毛幼犬，对所有人都很热情。她正处于学习的黄金期，希望能找到一个愿意陪伴她成长的家庭。',
  '{"vaccines": "已接种", "neuter": "未绝育", "chip": "已注册", "training": "正在学习"}',
  '李先生',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuClcJ1kGSejxdskDILVxhF1567_vIwNfhM3gcP6seQ8Lbd1W1W6sUL5ikTIseOuweE2Ve_y3g6xH-xlcrMsnN93yy66WF73_YpdBvJUgWJRHX0UGeLwU_J-aL8PaSkrAdJ_6MDpAwFgZJ7Iaj4pmpOzK3FnDLAEEswV75fVEkLyaU9kDH7Y27M8y37lItAq6WqhETeZdkMPZug5jCwCWh9wr3xsOO-4sv9QaP0iXuDyjwPOO2v6Y1khyFOr5ZETMBJFfa3ddu8Y5Wo',
  'dog'
),
(
  'snowball', '雪球', '波斯猫', '8 周', '7.2 公里', 'female',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBju-3FCGXhCA7vnMiCzeUtK1MD4WetSIkQ1wmPEa72Uw8N0GOIf69OY95sG9JqcqNCjfxqZ5wbfZC6dzmcny_DC19_BOpuP1eeEK1aCo4Y3Soq13ddCHQFwClG8mc_YKCDKuBTFwBsaHapDrGEDnwBugsy2_of4yBHWu1ao88XhG2kBVU1-rDFCXQD4WEAYnGwL4g4ffKUj8Lyocc9iNANBjmXUba9JSpWe2AQQWPU14YhzbAV7DltCk0D-ITVW220OghqFupozzs',
  1200, '上海市长宁区', '0.8 Kg', '雪球是一只优雅的白色波斯猫宝宝。',
  FALSE,
  '雪球需要精心的毛发护理。她性格比较安静，喜欢在窗台上晒太阳。',
  '{"vaccines": "第一针", "neuter": "未绝育", "chip": "无", "training": "会用猫砂"}',
  'Sarah',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDorhYGu9SF5uyTjjc6bDH8TOer8nKZdWo8tg0-px8a1iTeKeo4VajYdgvR_R-UaoF4iTNdIlALu-Vio5txHrqOFdR_VNncoAxj_K3gNs29_Ph9MdsosHynjBlCdiXjyQjP2YSXGphbx-IQHKNpNeV5FCyryG_4zJ5-Lz42mo--EtABfPxeFDG2U54VsoSrx1cNr57sIOlrVLzVXCue49Xbmjdj3qqA36X5gvg1A3-LbNUUOyix8OJcvEsZXl5EtgYZCGiZ312bPAI',
  'cat'
)
ON CONFLICT (id) DO NOTHING;
