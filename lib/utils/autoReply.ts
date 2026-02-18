const DIALOGUE_DB: { keywords: string[]; replies: string[] }[] = [
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
  },
];

const DEFAULT_REPLIES = [
  '收到您的消息了～稍后回复您～',
  '好的，我看看具体情况再回复您～',
  '感谢您的咨询，我们会尽快处理～',
  '您的消息已收到，请稍候～',
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickReply(userMessage: string): string {
  const trimmed = userMessage.trim().toLowerCase();
  if (!trimmed) return randomPick(DEFAULT_REPLIES);

  for (const group of DIALOGUE_DB) {
    const matched = group.keywords.some(kw => trimmed.includes(kw.toLowerCase()));
    if (matched) {
      return randomPick(group.replies);
    }
  }

  return randomPick(DEFAULT_REPLIES);
}
