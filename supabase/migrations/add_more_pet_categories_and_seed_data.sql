-- ============================================================
-- Extend pet categories and add more seed data
-- ============================================================

ALTER TABLE public.pets
  DROP CONSTRAINT IF EXISTS pets_category_check;

ALTER TABLE public.pets
  ADD CONSTRAINT pets_category_check
  CHECK (category IN ('all', 'dog', 'cat', 'rabbit', 'bird', 'hamster', 'turtle', 'fish', 'other'));

INSERT INTO public.pets (id, name, breed, age_text, distance, gender, image_url, price, location, weight, description, is_urgent, tags, story, health, foster_parent_name, foster_parent_avatar, category)
VALUES
-- ========== 狗狗 ==========
(
  'lucky', '幸运', '拉布拉多', '1 岁', '6.3 公里', 'male',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
  600, '上海市宝山区', '24 Kg', '幸运乐观外向，适合有娃家庭，超温顺不咬人。',
  FALSE, '{"已接种","已绝育","亲人"}',
  '幸运曾是一只导盲犬候选犬，因视力问题未能通过训练，但却因此有了更完善的基础训练底子，需要规律遛弯与陪伴。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "高级指令"}',
  '韩先生', 'https://i.pravatar.cc/128?img=11', 'dog'
),
(
  'cookie', '曲奇', '柯基', '8 个月', '3.2 公里', 'female',
  'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600&h=400&fit=crop',
  500, '上海市浦东新区', '10 Kg', '曲奇短腿萌翻，活泼好动，爱撒娇。',
  TRUE, '{"紧急","已绝育","无攻击性"}',
  '原主人出国，急需为曲奇找到新家。她已完成基础训练，会坐下、握手，是个乖巧的小可爱。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "基础训练"}',
  '张女士', 'https://i.pravatar.cc/128?img=5', 'dog'
),
(
  'max', '麦克斯', '边境牧羊犬', '3 岁', '8.1 公里', 'male',
  'https://images.unsplash.com/photo-1503256207526-0d5523284ff6?w=600&h=400&fit=crop',
  0, '上海市松江区', '20 Kg', '智商极高，需要大量运动和脑力刺激。',
  FALSE, '{"已接种","聪明","需要运动"}',
  '麦克斯是一只被牧场主人无力继续喂养而送出的边牧，能力极强，适合有经验且居住空间宽裕的家庭。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "高级指令"}',
  '赵先生', 'https://i.pravatar.cc/128?img=13', 'dog'
),
(
  'nana', '娜娜', '贵宾', '2 岁', '1.8 公里', 'female',
  'https://images.unsplash.com/photo-1616149270376-db739046c920?w=600&h=400&fit=crop',
  300, '上海市黄浦区', '5 Kg', '娜娜卷毛可爱，不掉毛，适合过敏体质。',
  FALSE, '{"不掉毛","已绝育","适合新手"}',
  '前主人因宝宝对狗毛敏感不得不送养，娜娜性格温顺，特别黏人，对小朋友非常友善。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "已注册", "training": "基础训练"}',
  '刘阿姨', 'https://i.pravatar.cc/128?img=9', 'dog'
),
-- ========== 猫猫 ==========
(
  'momo', '茉茉', '英短蓝白', '1 岁', '2.2 公里', 'female',
  'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&h=400&fit=crop',
  380, '上海市静安区', '3.8 Kg', '茉茉亲人黏人，适合新手家庭，颜值高。',
  FALSE, '{"已绝育","亲人","颜值高"}',
  '已适应猫砂盆，性格安静温柔，喜欢晒太阳，对陌生人友善，是一只标准的"傻白甜"猫咪。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "无", "training": "会用猫砂"}',
  '林小姐', 'https://i.pravatar.cc/128?img=47', 'cat'
),
(
  'tiger', '虎斑', '橘猫', '3 岁', '0.9 公里', 'male',
  'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&h=400&fit=crop',
  0, '上海市杨浦区', '6 Kg', '标准橘猫体型，热情话多，见人就蹭。',
  FALSE, '{"话多","亲人","已绝育"}',
  '虎斑在小区流浪了半年，被好心人救助后一直在室内生活，已完全适应家养环境，每天要喵喵叫着找人撸。',
  '{"vaccines": "已接种", "neuter": "已绝育", "chip": "无", "training": "会用猫砂"}',
  '陈阿姨', 'https://i.pravatar.cc/128?img=46', 'cat'
),
(
  'luna', '露娜', '布偶猫', '6 个月', '4.5 公里', 'female',
  'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=600&h=400&fit=crop',
  1500, '上海市长宁区', '2.8 Kg', '布偶特有蓝眼睛，温顺到没朋友，手感极佳。',
  FALSE, '{"蓝眼睛","超温顺","适合公寓"}',
  '露娜因原主人搬至不允许养宠物的小区而含泪送养，毛色纯正，健康档案完整，是值得信赖的高品质家猫。',
  '{"vaccines": "已接种", "neuter": "未绝育", "chip": "已注册", "training": "会用猫砂"}',
  '钱女士', 'https://i.pravatar.cc/128?img=43', 'cat'
),
-- ========== 兔子 ==========
(
  'mocha', '摩卡', '荷兰兔', '10 个月', '3.1 公里', 'male',
  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&h=400&fit=crop',
  90, '上海市徐汇区', '1.7 Kg', '摩卡温顺亲人，喜欢啃草饼和胡萝卜。',
  FALSE, '{"温顺","喜欢被抱","定点如厕"}',
  '需要宽敞活动空间与定期修剪指甲，对陌生人也很友好，适合有耐心的主人，不宜与猫狗同住。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  '陶姐', 'https://i.pravatar.cc/128?img=32', 'rabbit'
),
(
  'snow_rabbit', '雪儿', '安哥拉兔', '1 岁', '5.5 公里', 'female',
  'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600&h=400&fit=crop',
  200, '上海市嘉定区', '2.2 Kg', '全身白色长毛，云朵般的存在，需定期梳毛。',
  FALSE, '{"长毛","颜值高","需梳毛"}',
  '雪儿是一只长毛安哥拉兔，需要每周梳毛，生活习惯良好，适合热爱小动物且有耐心的饲主。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "定点如厕"}',
  '吴小姐', 'https://i.pravatar.cc/128?img=44', 'rabbit'
),
-- ========== 鸟类 ==========
(
  'sky', '小空', '虎皮鹦鹉', '8 个月', '2.8 公里', 'female',
  'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=600&h=400&fit=crop',
  180, '上海市普陀区', '0.1 Kg', '小空喜欢学唱歌，声音悦耳，性格活泼亲人。',
  FALSE, '{"会说话","活泼","上手"}',
  '小空已经学会了几句短句，每天清晨都会自动"报时"，需要每天放飞陪伴，适合有时间在家的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "上手训练"}',
  '杨女士', 'https://i.pravatar.cc/128?img=20', 'bird'
),
(
  'rio', '里奥', '玄凤鹦鹉', '2 岁', '6.7 公里', 'male',
  'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=600&h=400&fit=crop',
  350, '上海市闵行区', '0.1 Kg', '里奥头冠漂亮，喜欢听音乐，会主动找人互动。',
  FALSE, '{"头冠漂亮","喜欢音乐","亲人"}',
  '里奥在原来的家里和音响做了两年的"邻居"，已经学会跟着节拍摇头，需要每天最少1小时的陪伴时间。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "上手训练"}',
  '孙先生', 'https://i.pravatar.cc/128?img=15', 'bird'
),
-- ========== 仓鼠 ==========
(
  'pudding', '布丁', '金丝熊', '3 个月', '2.1 公里', 'female',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=400&fit=crop',
  50, '上海市虹口区', '0.2 Kg', '布丁是一只好奇心旺盛的小仓鼠，喜欢囤食。',
  FALSE, '{"适合入门","夜行","喜欢囤粮"}',
  '布丁喜欢夜间活动，白天大多数时间在睡觉，需要安静的笼养环境与稳定作息，饲养成本低。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应手喂"}',
  '叶阿姨', 'https://i.pravatar.cc/128?img=48', 'hamster'
),
-- ========== 乌龟 ==========
(
  'atlas', '阿特拉斯', '巴西红耳龟', '2 岁', '4.6 公里', 'male',
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&h=400&fit=crop',
  120, '上海市浦东新区', '0.6 Kg', '阿特拉斯性格安静爱晒背，是低维护宠物首选。',
  FALSE, '{"低维护","长寿","安静"}',
  '需要稳定水温(22-28°C)与晒台空间，每周换水喂食即可，适合有养龟经验或愿意学习的家庭。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '周先生', 'https://i.pravatar.cc/128?img=12', 'turtle'
),
-- ========== 鱼类 ==========
(
  'bubble', '泡泡', '孔雀鱼', '6 个月', '1.4 公里', 'female',
  'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=400&fit=crop',
  20, '上海市杨浦区', '0.01 Kg', '泡泡是一条尾鳍华丽的孔雀鱼，连缸一起送。',
  FALSE, '{"连缸送","低维护","颜值高"}',
  '适合入门级鱼缸，水质稳定即可健康成长，一缸约5条，连20L鱼缸和过滤器一起奉送给有缘人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "无需训练"}',
  '阿泽', 'https://i.pravatar.cc/128?img=60', 'fish'
),
(
  'nemo', '小尼莫', '小丑鱼', '1 岁', '7.2 公里', 'male',
  'https://images.unsplash.com/photo-1467657754686-27e4e4c4e3e9?w=600&h=400&fit=crop',
  280, '上海市长宁区', '0.02 Kg', '颜色鲜艳，在珊瑚背景下非常好看，附赠海缸。',
  FALSE, '{"海水鱼","颜值极高","附赠海缸"}',
  '小尼莫生活在已运行半年的30L海水缸中，整缸移交，需要有一定海水缸基础的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "无需训练"}',
  '程女士', 'https://i.pravatar.cc/128?img=49', 'fish'
),
-- ========== 其他 ==========
(
  'peanut', '花生', '非洲侏儒刺猬', '5 个月', '1.9 公里', 'female',
  'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&h=400&fit=crop',
  150, '上海市闵行区', '0.5 Kg', '花生刺软可摸，温和亲人，适合安静家庭。',
  FALSE, '{"刺软","夜行","低维护"}',
  '花生夜行性较强，需要稳定温度(24-30°C)与躲避屋，适合喜欢独特宠物且作息规律的主人。',
  '{"vaccines": "无", "neuter": "不适用", "chip": "无", "training": "适应环境"}',
  '许先生', 'https://i.pravatar.cc/128?img=57', 'other'
),
(
  'gizmo', '奇奇', '龙猫', '1 岁', '3.8 公里', 'male',
  'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=400&fit=crop',
  400, '上海市徐汇区', '0.5 Kg', '奇奇毛发柔软如云，活泼好动，跳跃能力强。',
  FALSE, '{"毛极软","跳跃力强","需要伙伴"}',
  '龙猫是群居动物，建议成对饲养。奇奇性格活跃，需要大笼子和每天放风时间，不适合幼儿家庭。',
  '{"vaccines": "无", "neuter": "未绝育", "chip": "无", "training": "适应环境"}',
  '方小姐', 'https://i.pravatar.cc/128?img=41', 'other'
)
ON CONFLICT (id) DO NOTHING;
