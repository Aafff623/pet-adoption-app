export type GrowthPlayCategory = 'rescue' | 'points' | 'community' | 'report';

export interface GrowthPlayCard {
  key: string;
  title: string;
  desc: string;
  icon: string;
  route: string;
  category: GrowthPlayCategory;
  startAt: string;
  endAt: string;
  badge: string;
}

export const GROWTH_PLAY_CARDS: GrowthPlayCard[] = [
  {
    key: 'city-rescue-challenge',
    title: '城市救助挑战',
    desc: '每周协作任务冲榜',
    icon: 'emoji_events',
    route: '/rescue-board',
    category: 'rescue',
    startAt: '2026-02-20T00:00:00+08:00',
    endAt: '2026-02-28T23:59:59+08:00',
    badge: '热门',
  },
  {
    key: 'points-double-day',
    title: '积分翻倍日',
    desc: '限时任务双倍积分',
    icon: 'bolt',
    route: '/points/tasks',
    category: 'points',
    startAt: '2026-02-22T00:00:00+08:00',
    endAt: '2026-02-24T23:59:59+08:00',
    badge: '限时',
  },
  {
    key: 'offline-community',
    title: '线下活动报名',
    desc: '社区义诊/领养日',
    icon: 'event',
    route: '/about-us',
    category: 'community',
    startAt: '2026-02-19T00:00:00+08:00',
    endAt: '2026-03-05T23:59:59+08:00',
    badge: '活动',
  },
  {
    key: 'growth-report',
    title: '成长报告周报',
    desc: '查看10天评分动态',
    icon: 'insights',
    route: '/messages',
    category: 'report',
    startAt: '2026-02-21T00:00:00+08:00',
    endAt: '2026-03-03T23:59:59+08:00',
    badge: '推荐',
  },
];
