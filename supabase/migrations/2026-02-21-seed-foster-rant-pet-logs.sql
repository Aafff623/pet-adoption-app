-- 为宠物详情页补充“寄养家庭吐槽”成长日志示例数据
-- 仅在未存在相同内容时插入，避免重复

INSERT INTO public.pet_logs (pet_id, author_id, content, created_at)
SELECT
  v.pet_id,
  u.id,
  v.content,
  NOW() - v.offset_interval
FROM (SELECT id FROM auth.users LIMIT 1) AS u
JOIN (
  VALUES
    ('barnaby', '寄养家庭吐槽：巴纳比每天都会叼着玩具巡逻，见到新客人先展示三轮转圈，社交属性拉满。', INTERVAL '48 hours'),
    ('barnaby', '寄养家庭吐槽：洗澡前装可怜，吹毛时又一脸享受，情绪反转比电视剧还快。', INTERVAL '18 hours'),
    ('misty', '寄养家庭吐槽：米丝缇清晨会按时踩奶叫醒，猫砂盆要求极高，铲慢一点就来催工。', INTERVAL '40 hours'),
    ('misty', '寄养家庭吐槽：晒太阳必须抢窗边C位，其他猫靠近就立刻进入“高冷女王”模式。', INTERVAL '16 hours'),
    ('loki', '寄养家庭吐槽：洛基散步路上逢人必打招呼，回家后还要复盘今天见过多少朋友。', INTERVAL '28 hours'),
    ('loki', '寄养家庭吐槽：吃饭速度冠军，听到开粮桶声音会提前在餐位端坐，纪律性过于优秀。', INTERVAL '10 hours')
) AS v(pet_id, content, offset_interval)
  ON true
JOIN public.pets p ON p.id = v.pet_id
WHERE u.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.pet_logs pl
    WHERE pl.pet_id = v.pet_id
      AND pl.content = v.content
  );
