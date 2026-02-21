-- ============================================================
-- 生态一：社区宠物达人体系 - 种子数据
-- 为 expert_profiles, expert_follows, expert_tips 插入示例数据
-- ============================================================

BEGIN;

-- 获取当前 auth.users 中的前 3 个用户，为他们创建达人档案
DO $$
DECLARE
  v_user_ids UUID[];
  v_user_count INTEGER;
  v_tips TEXT[] := ARRAY['trainer', 'nutritionist', 'medical_volunteer'];
  v_bios TEXT[] := ARRAY[
    '10年犬类训练经验，擅长解决狗狗行为问题，私信咨询享免费诊断。🐕',
    '宠物营养配餐专家，根据宠物体质制定个性化营养方案，让毛孩子吃得更健康。🥗',
    '动物医学学位，参与多项救助协作，分享宠物急救和健康知识。💊'
  ];
  v_avatars TEXT[] := ARRAY[
    'https://api.dicebear.com/7.x/avataaars/svg?seed=trainer',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=nutritionist',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=volunteer'
  ];
  v_cities TEXT[] := ARRAY['北京市', '上海市', '深圳市'];
  v_i INTEGER;
BEGIN
  -- 获取用户数据
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 3) INTO v_user_ids;
  v_user_count := array_length(v_user_ids, 1);
  
  -- 数据验证
  IF v_user_count IS NULL OR v_user_count = 0 THEN
    RAISE EXCEPTION 'ERROR: No users found in auth.users table. Please create at least one user first.';
  END IF;

  -- 为用户创建达人档案（已审核）
  FOR v_i IN 1..v_user_count LOOP
    INSERT INTO public.expert_profiles (
      user_id,
      level,
      certification_type,
      column_bio,
      status,
      created_at,
      updated_at
    ) VALUES (
      v_user_ids[v_i],
      CASE WHEN v_i = 1 THEN 'gold' WHEN v_i = 2 THEN 'silver' ELSE 'bronze' END,
      v_tips[v_i],
      v_bios[v_i],
      'approved',
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '5 days'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- 更新 profiles 表补充必要信息
    UPDATE public.profiles
    SET
      nickname = COALESCE(nickname, '达人' || v_i::TEXT),
      avatar_url = COALESCE(avatar_url, v_avatars[v_i]),
      bio = COALESCE(bio, v_bios[v_i]),
      city = COALESCE(city, v_cities[v_i]),
      points = COALESCE(points, 0) + 500
    WHERE id = v_user_ids[v_i];
  END LOOP;
  
  RAISE NOTICE 'Successfully created % expert profiles', v_user_count;
END $$;

-- 为已创建的达人添加粉丝关注关系
DO $$
DECLARE
  v_expert_user_id UUID;
  v_follower_id UUID;
  v_follow_count INTEGER := 0;
BEGIN
  -- 获取第一个达人
  SELECT user_id INTO v_expert_user_id FROM public.expert_profiles LIMIT 1;
  
  IF v_expert_user_id IS NULL THEN
    RAISE NOTICE 'INFO: No expert profiles found, skipping follows creation';
    RETURN;
  END IF;

  -- 遍历所有用户，为除达人外的其他用户创建关注
  FOR v_follower_id IN
    SELECT id FROM auth.users 
    WHERE id != v_expert_user_id
  LOOP
    INSERT INTO public.expert_follows (follower_id, expert_id)
    VALUES (v_follower_id, v_expert_user_id)
    ON CONFLICT DO NOTHING;
    v_follow_count := v_follow_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Successfully created % follow relationships', v_follow_count;
END $$;

-- 为达人添加打赏记录（需要积分充足）
DO $$
DECLARE
  v_expert_user_id UUID;
  v_tipper_id UUID;
  v_points INTEGER := 50;
  v_platform_cut INTEGER;
  v_expert_cut INTEGER;
  v_tip_count INTEGER := 0;
  v_tip_id UUID;
BEGIN
  -- 获取第一个达人
  SELECT user_id INTO v_expert_user_id FROM public.expert_profiles LIMIT 1;
  
  IF v_expert_user_id IS NULL THEN
    RAISE NOTICE 'INFO: No expert profiles found, skipping tips creation';
    RETURN;
  END IF;

  -- 先补充所有用户的积分（打赏者需要足够积分）
  UPDATE public.profiles
  SET points = COALESCE(points, 0) + 500
  WHERE points IS NULL OR points < 100;

  -- 遍历其他用户为达人打赏
  FOR v_tipper_id IN
    SELECT id FROM auth.users 
    WHERE id != v_expert_user_id
    LIMIT 5
  LOOP
    v_platform_cut := (v_points * 0.3)::INTEGER;
    v_expert_cut := v_points - v_platform_cut;
    
    -- 插入打赏记录
    INSERT INTO public.expert_tips (tipper_id, expert_id, points, platform_take, expert_received)
    VALUES (v_tipper_id, v_expert_user_id, v_points, v_platform_cut, v_expert_cut)
    RETURNING id INTO v_tip_id;
    
    IF v_tip_id IS NOT NULL THEN
      -- 插入收益记录
      INSERT INTO public.expert_earnings (expert_id, source, amount, tip_id, created_at)
      VALUES (v_expert_user_id, 'tip', v_expert_cut, v_tip_id, NOW() - INTERVAL '7 days' * v_tip_count);
      
      v_tip_count := v_tip_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Successfully created % tip records', v_tip_count;
END $$;

COMMIT;
