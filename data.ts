import { Pet, Message } from './types';

export const PETS_DATA: Pet[] = [
  {
    id: 'barnaby',
    name: '巴纳比',
    breed: '比格犬',
    age: '2 岁',
    distance: '2.5 公里',
    gender: 'male',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDd8gze_FbFR8b9nFnJNyOBvi8n2pH4no0g_zJ1k2Aw6qqvK5qhU8YoiqjxSP3gvgkv1FBd0NEdo0f_qnDB__yP61rj-5YbYCKHADWzPfEBgBxQLb_1MAmoZVypHJtkLPdotuG1fiITFIp4SPSEUzcYYRhmlzhFj7qeKlS66YNBjvvGrB2e8BMmeifJjofOdoZFEitzggIprTp0z8QFf55Z5wZe-kFmlj0oiX6pBwzyVj8BJlVdJ1UYDmboQb0muaa-_NBVISrZulqI',
    isUrgent: true,
    price: 500,
    location: '上海市静安区',
    weight: '12 Kg',
    description: '巴纳比是一只充满活力的比格犬，嗅觉灵敏，性格开朗。',
    fosterParent: {
        name: '张医生',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgVPpxg8HIumU7EpauZP9ZlqirzBnKLdJFGK3sIDR54NKgoMvWdCpOnQkKZ8i9pqr-ZwirabrItbbt19Vsp_Ks7rywsrwksbIasOlJwu_nzBSwVNsNqNU-QjsRBwhhPM8QaaDUMMydnkQNIgx8i8vIvll48zgOHd8bQb75k7SbZ6Q_TY-_ic2MXjg2J04C-ZxWIQTqZSB2ovFoiPFZMYQSivk3XgoNPRSlgXwh6z0jYRNW1FiTPEJPxBeGSAmJTnizmRheXOoL44o'
    },
    story: '巴纳比是我们从一个关闭的繁殖场救助出来的。虽然前半生比较艰难，但他依然对人类充满了信任和爱。他特别喜欢户外活动，需要一个能经常带他散步的主人。',
    health: {
        vaccines: '已接种',
        neuter: '已绝育',
        chip: '已注册',
        training: '基础训练'
    }
  },
  {
    id: 'misty',
    name: '米斯蒂',
    breed: '虎斑猫',
    age: '4 个月',
    distance: '1.2 公里',
    gender: 'female',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnNyWWqfayP1GgoxDLIagfEmeZpxpSLxyRczO5g2dEhb1Y2WU3CqfXgBG0sPuT6IsImFWOs8FXEsNO3E6sMcyiNUqgdtcKHbMm6GT_dYZzB8PNAYnsuMmMpRVJ0bXKPfMJVVo2Lp52fzmMi2zAAykB-xhAet5KgBlH5tDcf6R5o4FXEc7_rrzlEvdCGWqv-JqFLWz7Fd0e2BMg39xz2OXzBwE-I3_qI2CgoURwotKKGDxYIRAQphIRi_nSQkGJWC_ox-TARYfcQ_M',
    price: 200,
    location: '上海市黄浦区',
    weight: '2.5 Kg',
    description: '米斯蒂是一只害羞但温柔的小猫。',
    fosterParent: {
        name: '王阿姨',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmMrcfJyvmWq2f5POlSJWVrfw-9KNg547O1zLwC_giy9H7xKmjt07WYCse6tuVmlgUkoaIDPjt-vVhkBuF3BypTzcm-0pncSBcY98BnlWhqREqJYI3noZpdcYhlTp-wOaUNB3ht2TFx_XdrFe6FD-muNyni4oATKVG0P8pC0C4Q8IUbWBcV7LAFHCrHeRE1L3flJ-r1enfIvHFNfRBh9AQYjvhCkuWuNdAmViSofN2JvGOBwC7Kxe5RoxN93VcRqTejRIdx4ulOm0'
    },
    story: '米斯蒂是在暴雨天被发现在车底下的。她现在非常健康，喜欢玩逗猫棒，希望能找一个安静温暖的家。',
    health: {
        vaccines: '第一针',
        neuter: '未绝育',
        chip: '未注册',
        training: '会用猫砂'
    }
  },
  {
    id: 'loki',
    name: '洛基',
    breed: '混血犬',
    age: '3 岁',
    distance: '5 公里',
    gender: 'male',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyoly3o-HDa495YtgbRAZC-DUAjSNunRIHui8CrO8Jfg-67GJXjzA0iRdVvv7MEYrOy9rNqPSWIXCO6jHy-2cr4Sgn5rKLmjV7klXPoJFL4-_JbzTX-V-QMgiIqR8LSuMJLQp2pq1aJN3cGKm9ODrfeQN0YKyYH8-Tts7KNu7KEBjtOKsxTQ1vj-7KsLb0PhEkFaIdDkz-jT9gXaG5BzBt2ZGBA9WVuj9dwxm4P1g4Q0xuEAOhpOAfq7VXRTX4p1v9I0xrX-AGFys',
    price: 0,
    location: '上海市闵行区',
    weight: '18 Kg',
    description: '洛基是一只聪明且忠诚的伙伴。',
    fosterParent: {
        name: '陈教练',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClcJ1kGSejxdskDILVxhF1567_vIwNfhM3gcP6seQ8Lbd1W1W6sUL5ikTIseOuweE2Ve_y3g6xH-xlcrMsnN93yy66WF73_YpdBvJUgWJRHX0UGeLwU_J-aL8PaSkrAdJ_6MDpAwFgZJ7Iaj4pmpOzK3FnDLAEEswV75fVEkLyaU9kDH7Y27M8y37lItAq6WqhETeZdkMPZug5jCwCWh9wr3xsOO-4sv9QaP0iXuDyjwPOO2v6Y1khyFOr5ZETMBJFfa3ddu8Y5Wo'
    },
    story: '洛基因为原主人搬家而被遗弃。他受过良好的训练，会握手、坐下等指令。他对人非常友善，很适合有大孩子的家庭。',
    health: {
        vaccines: '已接种',
        neuter: '已绝育',
        chip: '已注册',
        training: '高级指令'
    }
  },
  {
    id: 'oreo',
    name: '奥利奥',
    breed: '兔子',
    age: '1 岁',
    distance: '800 米',
    gender: 'male',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnJi9iaykKdohg7fHpgDWu4KY8RPG6SyDwUls-nuFJpu38VJpayP-YxepNnXrf8vIU83Q1bV1eJL_IzKZfE9Sxz-LxBj9bVZd3eu-rk3-3V8mz7MNQrpnyeA_k1p4jN772gqcLzSL8AJ9FeC0xBNQQXbXXLMfnri9MC1UqcmSDqllTSrkvBZjlc232DNWtMmZ6t0IGhJER94kmnYSvKqcvKc9b3uuNfW-1nB1NyCYm8MdjGnX1sFClevTSPOFvBNPXxSUaH4y3wG8',
    price: 80,
    location: '上海市徐汇区',
    weight: '1.5 Kg',
    description: '奥利奥是一只黑白相间的侏儒兔。',
    fosterParent: {
        name: 'Lisa',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDorhYGu9SF5uyTjjc6bDH8TOer8nKZdWo8tg0-px8a1iTeKeo4VajYdgvR_R-UaoF4iTNdIlALu-Vio5txHrqOFdR_VNncoAxj_K3gNs29_Ph9MdsosHynjBlCdiXjyQjP2YSXGphbx-IQHKNpNeV5FCyryG_4zJ5-Lz42mo--EtABfPxeFDG2U54VsoSrx1cNr57sIOlrVLzVXCue49Xbmjdj3qqA36X5gvg1A3-LbNUUOyix8OJcvEsZXl5EtgYZCGiZ312bPAI'
    },
    story: '奥利奥喜欢吃胡萝卜叶子，性格比较独立，但也喜欢被轻轻抚摸耳朵。需要注意家里电线的收纳哦。',
    health: {
        vaccines: '无',
        neuter: '未绝育',
        chip: '无',
        training: '定点如厕'
    }
  },
  {
    id: 'daisy',
    name: '戴西',
    breed: '金毛',
    age: '6 个月',
    distance: '3.5 公里',
    gender: 'female',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCkU61rSmnjutmCrsbw4HL4dLoYNxu_xnKeDkqPqkyiu_NwlS2ntXZEQ1yRnNi1mVKNEpqn1EaS6OZ_I1jkXH4Xh-S8jUjgBrpSdeNv7c7UMfr1sjgOLNydQ4iRMThPx8UKWwdG2ibTpooI3A9tPysSrbf8kqW6Cdke6Nb9K-JL31oSxrFRqZmf8JE-0OHw3YLwitRBSKLRVDiNyDP_YeI1dkJSfjZyH_9vV2C2lwb_XikvKZf7tdI5Jsw3UPC2UJbNTAGfteKgGI',
    price: 800,
    location: '上海市浦东新区',
    weight: '15 Kg',
    description: '戴西是人见人爱的小天使。',
    fosterParent: {
        name: '李先生',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClcJ1kGSejxdskDILVxhF1567_vIwNfhM3gcP6seQ8Lbd1W1W6sUL5ikTIseOuweE2Ve_y3g6xH-xlcrMsnN93yy66WF73_YpdBvJUgWJRHX0UGeLwU_J-aL8PaSkrAdJ_6MDpAwFgZJ7Iaj4pmpOzK3FnDLAEEswV75fVEkLyaU9kDH7Y27M8y37lItAq6WqhETeZdkMPZug5jCwCWh9wr3xsOO-4sv9QaP0iXuDyjwPOO2v6Y1khyFOr5ZETMBJFfa3ddu8Y5Wo'
    },
    story: '戴西是一只性格极好的金毛幼犬，对所有人都很热情。她正处于学习的黄金期，希望能找到一个愿意陪伴她成长的家庭。',
    health: {
        vaccines: '已接种',
        neuter: '未绝育',
        chip: '已注册',
        training: '正在学习'
    }
  },
  {
    id: 'snowball',
    name: '雪球',
    breed: '波斯猫',
    age: '8 周',
    distance: '7.2 公里',
    gender: 'female',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBju-3FCGXhCA7vnMiCzeUtK1MD4WetSIkQ1wmPEa72Uw8N0GOIf69OY95sG9JqcqNCjfxqZ5wbfZC6dzmcny_DC19_BOpuP1eeEK1aCo4Y3Soq13ddCHQFwClG8mc_YKCDKuBTFwBsaHapDrGEDnwBugsy2_of4yBHWu1ao88XhG2kBVU1-rDFCXQD4WEAYnGwL4g4ffKUj8Lyocc9iNANBjmXUba9JSpWe2AQQWPU14YhzbAV7DltCk0D-ITVW220OghqFupozzs',
    price: 1200,
    location: '上海市长宁区',
    weight: '0.8 Kg',
    description: '雪球是一只优雅的白色波斯猫宝宝。',
    fosterParent: {
        name: 'Sarah',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDorhYGu9SF5uyTjjc6bDH8TOer8nKZdWo8tg0-px8a1iTeKeo4VajYdgvR_R-UaoF4iTNdIlALu-Vio5txHrqOFdR_VNncoAxj_K3gNs29_Ph9MdsosHynjBlCdiXjyQjP2YSXGphbx-IQHKNpNeV5FCyryG_4zJ5-Lz42mo--EtABfPxeFDG2U54VsoSrx1cNr57sIOlrVLzVXCue49Xbmjdj3qqA36X5gvg1A3-LbNUUOyix8OJcvEsZXl5EtgYZCGiZ312bPAI'
    },
    story: '雪球需要精心的毛发护理。她性格比较安静，喜欢在窗台上晒太阳。',
    health: {
        vaccines: '第一针',
        neuter: '未绝育',
        chip: '无',
        training: '会用猫砂'
    }
  }
];

export const MESSAGES_DATA: Message[] = [
    {
        id: '1',
        sender: '阳光流浪动物救助站',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6OE_kpEyZ3SEWTRrMb0UePsDBRIP6K_0HMmsJobM8hd2--CThdLXenkHHoAD9C5Ks9HbJBze5wqQpZwpK_2IkhWS_4c_fmQ5QgL2cVQNdAkzSmseP5KKP7cwuGWjYpLaJZto650wQG8cVYdPhR7w_ZBMo81IMcdOFtU1wbueFuhw__wzxXUzaHNthkUghqxivfEeFZotbzbf0szKahWysvd7VcyxG7ZrBE1fdS2ElbzlWXc-ID8TQueNU_4ruXrnV9ChvB-2BpBQ',
        content: '请问那只叫“豆豆”的金毛还在吗？我想申请领养。',
        time: '10:45',
        unreadCount: 2
    },
    {
        id: '2',
        sender: '系统通知',
        avatar: '', // Handled by icon
        content: '您的实名认证已通过，快去完善资料吧！',
        time: '刚刚',
        isSystem: true
    },
    {
        id: '3',
        sender: '李阿姨猫咪领养',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmMrcfJyvmWq2f5POlSJWVrfw-9KNg547O1zLwC_giy9H7xKmjt07WYCse6tuVmlgUkoaIDPjt-vVhkBuF3BypTzcm-0pncSBcY98BnlWhqREqJYI3noZpdcYhlTp-wOaUNB3ht2TFx_XdrFe6FD-muNyni4oATKVG0P8pC0C4Q8IUbWBcV7LAFHCrHeRE1L3flJ-r1enfIvHFNfRBh9AQYjvhCkuWuNdAmViSofN2JvGOBwC7Kxe5RoxN93VcRqTejRIdx4ulOm0',
        content: '好的，我们约个时间见面，您可以带上证件。',
        time: '昨天'
    },
    {
        id: '4',
        sender: '快乐爪子收容所',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2F9fr1W1_YExTFQNIaskr233XphoAKQBTL-tymIcCD3KwdRgxhzDgB0JJWpVFnyEmCizFC7GUmedMJLAgsG8_lBDQA7NP3cTBkzs3pJ6VySuT2WiuOcb5uAzwfV28NtDAZT16tIjFtuCLVrHmWHCWQjOxkkjtSj36nK2vgO6q0BLmpLjac74kXZkRwr9BuMWezSaHv0E4W4ew9q6CzyyDBFHrUULgZ4GxlC3mFUMySBppmgOvP4kCfQvYFo7ikYnxUbjofiBlk4w',
        content: '非常感谢您的爱心捐赠！',
        time: '星期一'
    },
    {
        id: '5',
        sender: '王先生 (领养人)',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClcJ1kGSejxdskDILVxhF1567_vIwNfhM3gcP6seQ8Lbd1W1W6sUL5ikTIseOuweE2Ve_y3g6xH-xlcrMsnN93yy66WF73_YpdBvJUgWJRHX0UGeLwU_J-aL8PaSkrAdJ_6MDpAwFgZJ7Iaj4pmpOzK3FnDLAEEswV75fVEkLyaU9kDH7Y27M8y37lItAq6WqhETeZdkMPZug5jCwCWh9wr3xsOO-4sv9QaP0iXuDyjwPOO2v6Y1khyFOr5ZETMBJFfa3ddu8Y5Wo',
        content: '狗狗已经适应新环境了，发几张照片给您看看。',
        time: '09-15'
    },
    {
        id: '6',
        sender: '爱心流浪站',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFK5OO9FCcRvPLU_EMx2sINbGBPV8bhbWwK02lxi5hcGeBBKWTyBggHxShmVivoUI3MgN7C79FA6iDHmUmNjgmzxGYnf3POKyxWrIy1HY0klKJenbIs-LrnsJ974rufPkr1KsT9x13bo9ePZOpo9F7IPOUksoRd7qZ6x7KwMhnaUDAK7gDnTnx-PVYG3GZYtHuX7H6DJdihQ_YoykY03Vt2QXZ6yf8f82lcgqwDlwUb_q1LtlI30vJB6oyEhUuaT30KWmpyeyRSZo',
        content: '领养协议已经发送到您的邮箱，请查收。',
        time: '09-12'
    }
];

// --- Favorite Management ---
const FAVORITES_STORAGE_KEY = 'pet_favorites';

export const getFavoritePetIds = (): string[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Failed to parse favorites from localStorage", error);
    return [];
  }
};

export const addFavoritePet = (petId: string): void => {
  const favorites = getFavoritePetIds();
  if (!favorites.includes(petId)) {
    favorites.push(petId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }
};

export const removeFavoritePet = (petId: string): void => {
  let favorites = getFavoritePetIds();
  favorites = favorites.filter(id => id !== petId);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

export const isPetFavorited = (petId: string): boolean => {
  return getFavoritePetIds().includes(petId);
};


export const getPetById = (id: string): Pet | undefined => {
  return PETS_DATA.find(pet => pet.id === id);
};

export const getRecommendedPet = (): Pet => {
  return PETS_DATA.find(pet => pet.id === 'barnaby') || PETS_DATA[0];
};

export const getPetList = (): Pet[] => {
  return PETS_DATA.filter(pet => pet.id !== 'barnaby');
};

export const getMessageById = (id: string): Message | undefined => {
    return MESSAGES_DATA.find(msg => msg.id === id);
};