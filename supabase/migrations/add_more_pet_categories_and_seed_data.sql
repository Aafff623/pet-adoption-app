-- ============================================================
-- Extend pet categories and add more seed data
-- ============================================================

ALTER TABLE public.pets
  DROP CONSTRAINT IF EXISTS pets_category_check;

ALTER TABLE public.pets
  ADD CONSTRAINT pets_category_check
  CHECK (category IN ('all', 'dog', 'cat', 'rabbit', 'bird', 'hamster', 'turtle', 'fish', 'other'));

INSERT INTO public.pets (id, name, breed, age_text, distance, gender, image_url, price, location, weight, description, is_urgent, story, health, foster_parent_name, foster_parent_avatar, category)
VALUES
(
  'pudding', '布丁', '金丝熊', '3 个月', '2.1 公里', 'female',
  'https://placehold.co/600x400?text=Hamster',
  50, '上海市虹口区', '0.2 Kg', '布丁是一只亲人好奇的小仓鼠。',
  FALSE,
  '布丁喜欢夜间活动，需要安静的笼养环境与稳定作息。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应手喂"}',
  '叶阿姨',
  'https://placehold.co/128x128?text=FP',
  'hamster'
),
(
  'atlas', '阿特拉斯', '巴西红耳龟', '1 岁', '4.6 公里', 'male',
  'https://placehold.co/600x400?text=Turtle',
  120, '上海市浦东新区', '0.6 Kg', '阿特拉斯性格安静，喜欢晒背。',
  FALSE,
  '需要稳定水温与晒台空间，适合有养龟经验的家庭。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '周先生',
  'https://placehold.co/128x128?text=FP',
  'turtle'
),
(
  'bubble', '泡泡', '孔雀鱼', '6 个月', '1.4 公里', 'female',
  'https://placehold.co/600x400?text=Fish',
  20, '上海市杨浦区', '0.1 Kg', '泡泡是一条活泼的小孔雀鱼。',
  FALSE,
  '适合入门级鱼缸，水质稳定即可健康成长。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应鱼缸"}',
  '阿泽',
  'https://placehold.co/128x128?text=FP',
  'fish'
),
(
  'sky', '小空', '虎皮鹦鹉', '8 个月', '2.8 公里', 'female',
  'https://placehold.co/600x400?text=Bird',
  180, '上海市普陀区', '0.4 Kg', '小空喜欢学声音，性格活泼。',
  FALSE,
  '小空擅长互动，需要每天放飞与陪伴时间。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "上手训练"}',
  '杨女士',
  'https://placehold.co/128x128?text=FP',
  'bird'
),
(
  'mocha', '摩卡', '荷兰兔', '10 个月', '3.1 公里', 'male',
  'https://placehold.co/600x400?text=Rabbit',
  90, '上海市徐汇区', '1.7 Kg', '摩卡温顺亲人，喜欢啃草饼。',
  FALSE,
  '需要宽敞活动空间与定期修剪指甲。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  '陶姐',
  'https://placehold.co/128x128?text=FP',
  'rabbit'
),
(
  'lucky', '幸运', '拉布拉多', '1 岁', '6.3 公里', 'male',
  'https://placehold.co/600x400?text=Dog',
  600, '上海市宝山区', '24 Kg', '幸运乐观外向，适合家庭陪伴。',
  FALSE,
  '幸运喜欢户外活动，需要规律遛弯与训练。',
  '{"vaccines": "已接种", "neuter": "未绝育", "chip": "已注册", "training": "基础训练"}',
  '韩先生',
  'https://placehold.co/128x128?text=FP',
  'dog'
),
(
  'momo', '茉茉', '英短蓝白', '1 岁', '2.2 公里', 'female',
  'https://placehold.co/600x400?text=Cat',
  380, '上海市静安区', '3.8 Kg', '茉茉亲人黏人，适合新手家庭。',
  FALSE,
  '已适应猫砂盆，性格安静，喜欢晒太阳。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "无", "training": "会用猫砂"}',
  '林小姐',
  'https://placehold.co/128x128?text=FP',
  'cat'
),
(
  'peanut', '花生', '刺猬', '5 个月', '1.9 公里', 'female',
  'https://placehold.co/600x400?text=Hedgehog',
  150, '上海市闵行区', '0.5 Kg', '花生性格温和，需要安静环境。',
  FALSE,
  '花生夜行性较强，需要稳定温度与躲避屋。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '许先生',
  'https://placehold.co/128x128?text=FP',
  'other'
)
ON CONFLICT (id) DO NOTHING;
