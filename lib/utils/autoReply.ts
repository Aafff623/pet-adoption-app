const DIALOGUE_DB: { keywords: string[]; replies: string[]; matchWhenShortOnly?: boolean }[] = [
  {
    keywords: ['申请', '流程', '审核', '通过', '领养流程', '怎么申请'],
    replies: [
      '领养流程很简单：填写申请后我们会尽快审核，一般 3-5 个工作日内会有结果～',
      '您提交申请后，我们会联系寄养家庭进行沟通，审核通过后会通知您见面～',
      '申请提交后请耐心等待，我们会认真审核每一位申请人的信息。',
    ],
  },
  {
    keywords: ['疫苗', '绝育', '生病', '驱虫', '健康', '体检'],
    replies: [
      'TA 的健康状况在详情页有说明，疫苗和驱虫都是按时做的～',
      '寄养期间我们都会定期带 TA 体检，健康状况可以放心～',
      '如有健康方面的疑问，见面时可以详细沟通哦。',
    ],
  },
  {
    keywords: ['时间', '地点', '预约', '见面', '什么时候', '哪里'],
    replies: [
      '审核通过后我们会协调双方时间安排见面，一般周末比较方便～',
      '见面地点可以跟寄养家庭商量，通常选在双方都方便的地方～',
      '您方便的时间段可以告诉我，我帮您跟寄养家庭约一下～',
    ],
  },
  {
    keywords: ['你好', '您好', '在吗', '在么', '有人吗', 'hi', 'hello'],
    replies: [
      '您好～我是寄养家庭，有什么想了解的吗？',
      '在的～请问有什么可以帮您？',
      '您好，欢迎咨询领养事宜～',
    ],
  },
  {
    keywords: ['谢谢', '感谢', '多谢', '辛苦了'],
    replies: [
      '不客气～希望 TA 能遇到有缘的新家～',
      '谢谢您的关注，有任何问题随时问我～',
      '不客气，期待您的好消息～',
    ],
  },
  {
    keywords: ['好的', '行', '可以', '没问题', 'ok', '嗯'],
    replies: [
      '好的～有新的进展我会及时联系您～',
      '收到～那我们保持联系～',
      '好的，期待与您进一步沟通～',
    ],
    matchWhenShortOnly: true,
  },
  {
    keywords: ['费用', '多少钱', '押金', '领养费', '价格', '收费'],
    replies: [
      '详情页有标注的，领养费主要是覆盖疫苗和绝育这些成本～',
      '费用在页面写着呢，没有额外隐藏收费哈～',
      '领养费不高，主要是为了筛选真心想养的家庭～',
    ],
  },
  {
    keywords: ['性格', '乖不乖', '咬人', '掉毛', '叫', '温顺', '活泼'],
    replies: [
      'TA 性格挺好的，详情页有写，见面时您也能感受一下～',
      '掉毛的话猫狗多少都有，日常梳一梳就好～',
      '不会乱咬人的，我们养这么久都挺乖的～',
    ],
  },
  {
    keywords: ['条件', '要求', '住房', '独居', '租房', '有房'],
    replies: [
      '没有硬性要求，主要是看您有没有时间和责任心～',
      '租房也可以的，只要房东允许养宠物～',
      '我们更看重您对 TA 的用心，其他都好商量～',
    ],
  },
  {
    keywords: ['多久', '还没', '什么时候', '几天', '等', '催'],
    replies: [
      '快了快了，我们这边也在抓紧～',
      '不好意思让您久等，马上就有结果～',
      '再等等哈，一有消息我第一时间告诉您～',
    ],
  },
  {
    keywords: ['不合适', '再考虑', '算了', '不领养了'],
    replies: [
      '没事的，领养是大事，考虑清楚最重要～',
      '理解～以后有需要随时联系～',
      '好的，祝您顺利找到合适的伙伴～',
    ],
  },
  {
    keywords: ['再见', '祝好', '拜拜', '88'],
    replies: [
      '再见～有需要随时找我～',
      '拜拜，祝您一切顺利～',
      '好的，保持联系～',
    ],
  },
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SHORT_MESSAGE_MAX_LEN = 6;

export function pickReply(userMessage: string): string {
  const trimmed = userMessage.trim().toLowerCase();
  if (!trimmed) return '';

  for (const group of DIALOGUE_DB) {
    const keywordMatched = group.keywords.some(kw => trimmed.includes(kw.toLowerCase()));
    const shortOnly = 'matchWhenShortOnly' in group && group.matchWhenShortOnly;
    const matched = keywordMatched && (!shortOnly || trimmed.length <= SHORT_MESSAGE_MAX_LEN);
    if (matched) {
      return randomPick(group.replies);
    }
  }

  return '';
}
