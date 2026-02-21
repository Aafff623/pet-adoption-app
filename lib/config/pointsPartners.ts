export interface PointsPartner {
  key: string;
  name: string;
  impact: string;
  points: number;
  methods: string[];
}

export const POINTS_PARTNERS: PointsPartner[] = [
  {
    key: 'rescue-kitchen',
    name: '暖心救助厨房',
    impact: '100 分可提供 1 份热餐及营养守护包',
    points: 100,
    methods: ['积分直捐（即时到账）', '积分 + 线下物资（联系运营）'],
  },
  {
    key: 'health-station',
    name: '流浪医疗站',
    impact: '180 分用作疫苗或复诊基金支持',
    points: 180,
    methods: ['专项医疗基金捐赠', '病例定向援助（留言备注）'],
  },
  {
    key: 'community-hero',
    name: '社区志愿奖助',
    impact: '每 60 分可兑换志愿材料与激励卡',
    points: 60,
    methods: ['志愿者物资支持', '社区活动奖助支持'],
  },
];

export const getPointsPartnerByKey = (key: string): PointsPartner | null => {
  return POINTS_PARTNERS.find((item) => item.key === key) ?? null;
};
