import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitAdoptionApplication, fetchUserApplicationForPet } from '../lib/api/adoption';
import { getOrCreateSystemConversation, insertSystemReply } from '../lib/api/messages';
import { fetchPetById } from '../lib/api/pets';
import { generateAndSaveMatchScore, fetchMatchScore } from '../lib/api/adoptionMatch';
import type { AdoptionMatchScore, MatchQuestionnaire } from '../types';
import type { Pet } from '../types';

const MAX_MESSAGE_LENGTH = 200;

// ============================================================
// 匹配评分卡片
// ============================================================
const RISK_COLOR: Record<string, string> = {
  low: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
};
const RISK_LABEL: Record<string, string> = { low: '低', medium: '中', high: '高' };

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400 mb-1">
      <span>{label}</span>
      <span className="font-semibold text-gray-700 dark:text-zinc-300">{score}</span>
    </div>
    <div className="h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700"
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const MatchScoreCard: React.FC<{ score: AdoptionMatchScore }> = ({ score }) => (
  <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-zinc-700 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">🤖 AI 匹配评分</h3>
      <span
        className={`text-2xl font-extrabold ${
          score.overallScore >= 75 ? 'text-green-500' : score.overallScore >= 50 ? 'text-amber-500' : 'text-red-500'
        }`}
      >
        {score.overallScore}
      </span>
    </div>

    <div className="space-y-2.5">
      <ScoreBar label="居住稳定性" score={score.stabilityScore} />
      <ScoreBar label="陪伴时间" score={score.timeScore} />
      <ScoreBar label="经济能力" score={score.costScore} />
      <ScoreBar label="经验准备度" score={score.experienceScore} />
    </div>

    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-zinc-400">过敏风险</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[score.allergyRiskLevel]}`}>
        {RISK_LABEL[score.allergyRiskLevel]}
      </span>
    </div>

    <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{score.summary}</p>

    {score.riskNotes && (
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <span className="material-icons-round text-amber-500 text-base mt-0.5">warning_amber</span>
        <p className="text-xs text-amber-700 dark:text-amber-300">{score.riskNotes}</p>
      </div>
    )}

    {score.suggestions && (
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <span className="material-icons-round text-blue-500 text-base mt-0.5">lightbulb</span>
        <p className="text-xs text-blue-700 dark:text-blue-300">{score.suggestions}</p>
      </div>
    )}

    <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center">仅供参考，不替代人工判断</p>
  </div>
);

const isRefinedScore = (score: AdoptionMatchScore | null): boolean => {
  if (!score?.rawPayload) return false;
  const source = score.rawPayload['source'];
  return source === 'ai_refined_v1';
};

const buildScoreReportText = (petName: string, score: AdoptionMatchScore): string => {
  return [
    `📊 ${petName} 的 AI 匹配评估报告已生成`,
    `总分：${score.overallScore}`,
    `- 居住稳定性：${score.stabilityScore}`,
    `- 陪伴时间：${score.timeScore}`,
    `- 经济能力：${score.costScore}`,
    `- 经验准备度：${score.experienceScore}`,
    `过敏风险：${RISK_LABEL[score.allergyRiskLevel]}`,
    `综合建议：${score.summary}`,
    score.riskNotes ? `风险提示：${score.riskNotes}` : '',
    score.suggestions ? `改进建议：${score.suggestions}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const AdoptionForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const petId = searchParams.get('petId') ?? '';

  // 基础表单字段
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [housingType, setHousingType] = useState('自有住房');
  const [livingStatus, setLivingStatus] = useState('合租/同住');
  const [hasExperience, setHasExperience] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // AI 匹配问卷扩展字段
  const [homeSize, setHomeSize] = useState('50-100㎡');
  const [dailyFreeHours, setDailyFreeHours] = useState(4);
  const [monthlyBudget, setMonthlyBudget] = useState('500-1000');
  const [hasAllergy, setHasAllergy] = useState(false);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [workStyle, setWorkStyle] = useState('通勤');

  // AI 评分状态
  const [pet, setPet] = useState<Pet | null>(null);
  const [matchScore, setMatchScore] = useState<AdoptionMatchScore | null>(null);
  const [scoreTaskRunning, setScoreTaskRunning] = useState(false);
  const [scoreRefining, setScoreRefining] = useState(false);
  const [showScoreNoticeModal, setShowScoreNoticeModal] = useState(false);
  const [showScoreBenefitModal, setShowScoreBenefitModal] = useState(false);

  useEffect(() => {
    if (!petId) return;
    const check = async () => {
      if (user) {
        const existing = await fetchUserApplicationForPet(user.id, petId);
        if (existing) {
          showToast('您已提交过申请，请等待审核结果');
          navigate(-1);
          return;
        }
        // 加载已有匹配评分
        const score = await fetchMatchScore(user.id, petId).catch(() => null);
        setMatchScore(score);
        setScoreRefining(Boolean(score && !isRefinedScore(score)));
      }
      const loadedPet = await fetchPetById(petId);
      if (loadedPet) {
        if (loadedPet.status !== 'available' && loadedPet.status !== undefined) {
          showToast('该宠物已不可领养');
          navigate(-1);
          return;
        }
        setPet(loadedPet);
      }
    };
    check();
  }, [petId, user, navigate, showToast]);

  useEffect(() => {
    if (!user || !petId || !scoreRefining) return;

    const timer = window.setInterval(async () => {
      const latest = await fetchMatchScore(user.id, petId).catch(() => null);
      if (!latest) return;
      setMatchScore(latest);
      if (isRefinedScore(latest)) {
        setScoreRefining(false);
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [user, petId, scoreRefining]);

  useEffect(() => {
    const validName = name.trim().length > 0;
    const validMessage = message.trim().length > 0 && message.trim().length <= MAX_MESSAGE_LENGTH;
    setIsFormValid(validName && validMessage);
  }, [name, message]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const startBackgroundScoreTask = (options?: { showLaunchModal?: boolean; showQueuedToast?: boolean }): boolean => {
    if (!user || !pet) return false;
    if (message.trim().length < 10) {
      showToast('请先填写申请寄语（至少 10 字）再获取评分');
      return false;
    }
    if (scoreTaskRunning) {
      showToast('积分正在后台计算中，请稍候');
      return false;
    }

    const showLaunchModal = options?.showLaunchModal ?? false;
    const showQueuedToast = options?.showQueuedToast ?? false;

    if (showLaunchModal) {
      setShowScoreNoticeModal(true);
      window.setTimeout(() => setShowScoreNoticeModal(false), 2400);
    }

    setScoreTaskRunning(true);
    setScoreRefining(true);

    const questionnaire: MatchQuestionnaire = {
      housingType,
      livingStatus,
      hasExperience,
      homeSize,
      dailyFreeHours,
      monthlyBudget,
      hasAllergy,
      hasOtherPets,
      workStyle,
      message: message.trim(),
    };

    void (async () => {
      try {
        const score = await generateAndSaveMatchScore(pet, questionnaire, user.id, petId, undefined, {
          onRefined: refined => {
            setMatchScore(refined);
            setScoreRefining(false);
            showToast('AI 评估已完成，请到消息中心查看报告');
          },
          onRefineError: () => {
            setScoreRefining(false);
            showToast('AI 精修失败，当前展示快速评分');
          },
        });

        setMatchScore(score);
        if (showQueuedToast) {
          showToast('积分已进入后台计算，您可直接提交申请');
        }
      } catch (err) {
        setScoreRefining(false);
        showToast(err instanceof Error ? err.message : 'AI 评分失败，请稍后重试');
      } finally {
        setScoreTaskRunning(false);
      }
    })();

    return true;
  };

  const queueAssessmentReportAfterSubmit = (systemConvId: string, petName: string) => {
    window.setTimeout(() => {
      void (async () => {
        if (!user) return;

        const trySendReport = async (remainingRetry: number): Promise<void> => {
          const latest = await fetchMatchScore(user.id, petId).catch(() => null);
          if (latest) {
            await insertSystemReply(systemConvId, buildScoreReportText(petName, latest));
            return;
          }
          if (remainingRetry > 0) {
            window.setTimeout(() => {
              void trySendReport(remainingRetry - 1);
            }, 6000);
            return;
          }
          await insertSystemReply(systemConvId, 'AI 评估正在生成中，完成后会自动补发评估报告。');
        };

        await trySendReport(1);
      })();
    }, 10000);
  };

  const handleGetMatchScore = () => {
    const started = startBackgroundScoreTask({ showLaunchModal: true, showQueuedToast: true });
    if (!started || !user || !pet) return;

    void (async () => {
      try {
        const systemConvId = await getOrCreateSystemConversation(user.id);
        await insertSystemReply(systemConvId, `已收到“${pet.name}”的积分评估请求，正在为您计算中，完成后会自动通知您。`);
      } catch {
        // 忽略系统消息失败，不影响主流程
      }
    })();
  };

  const submitApplication = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!petId) {
      setErrorMsg('未指定要申请的宠物，请返回重新选择');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await submitAdoptionApplication({
        userId: user.id,
        petId,
        fullName: name.trim(),
        age: age.trim() || '未填写',
        occupation: occupation.trim() || '未填写',
        housingType,
        livingStatus,
        hasExperience,
        message: message.trim(),
      });
      showToast('申请已成功提交！');
      const systemConvId = await getOrCreateSystemConversation(user.id);
      setTimeout(() => insertSystemReply(systemConvId, '您的领养申请已收到，我们正在审核中...'), 0);
      setTimeout(() => navigate('/messages'), 2000);
      setTimeout(() => insertSystemReply(systemConvId, '审核员已收到您的申请，正在核实信息，预计 1-3 个工作日完成审核。'), 3000);
      setTimeout(() => insertSystemReply(systemConvId, '您的申请已进入最终审核阶段，结果将通过消息通知您，请耐心等待！'), 8000);

      const shouldGenerateReport = message.trim().length >= 10;
      if (shouldGenerateReport) {
        if (!matchScore && !scoreTaskRunning && !scoreRefining) {
          const started = startBackgroundScoreTask({ showLaunchModal: false, showQueuedToast: false });
          if (started && pet) {
            setTimeout(() => {
              void insertSystemReply(systemConvId, `已自动为“${pet.name}”发起积分评估，约 10 秒后推送评估报告。`);
            }, 1000);
          }
        }
        queueAssessmentReportAfterSubmit(systemConvId, pet?.name ?? '该宠物');
      }
    } catch {
      setErrorMsg('提交失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const shouldNudgeAiScore =
      message.trim().length >= 10 &&
      !matchScore &&
      !scoreTaskRunning &&
      !scoreRefining;

    if (shouldNudgeAiScore) {
      setShowScoreBenefitModal(true);
      return;
    }

    await submitApplication();
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col font-sans fade-in">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
          <div className="w-16 h-16 border-4 border-white border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {showScoreNoticeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[997] px-6">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-zinc-700">
            <div className="flex items-start gap-3">
              <span className="material-icons-round text-primary">auto_awesome</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">正在为您计算积分</p>
                <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  已转入后台处理，您现在可以直接提交申请。评估完成后会通过消息通知您。
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScoreNoticeModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 active:scale-[0.97] transition-all"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showScoreBenefitModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[996] px-6">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-zinc-700">
            <div className="flex items-start gap-3">
              <span className="material-icons-round text-primary">tips_and_updates</span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">先做 AI 评估，领养通过率更高</p>
                <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
                  AI 会从居住稳定性、陪伴时间、经济能力、经验准备度给出评估，并生成专属建议。报告会自动发送到消息，帮助你更快完善申请。
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScoreBenefitModal(false);
                  handleGetMatchScore();
                }}
                className="py-2 text-xs rounded-lg bg-primary text-black font-semibold active:scale-[0.97] transition-all"
              >
                先去 AI 评估
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScoreBenefitModal(false);
                  void submitApplication();
                }}
                className="py-2 text-xs rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 active:scale-[0.97] transition-all"
              >
                仍然直接提交
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <span className="material-icons-round text-2xl text-gray-800">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-wide">填写领养申请</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow px-5 py-6 space-y-8 pb-32 max-w-lg mx-auto w-full">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
          <div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
          <div className="h-1.5 w-1/3 rounded-full bg-gray-200"></div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 个人信息 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">person</span>
              <h2 className="text-lg font-bold text-gray-900">个人信息</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="name">
                  您的姓名<span className="text-red-500">*</span>
                </label>
                <input
                  className={`block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ${name.trim().length === 0 ? 'ring-red-300' : 'ring-gray-100'}`}
                  id="name"
                  placeholder="请输入真实姓名"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  aria-required="true"
                />
                {name.trim().length === 0 && (
                  <p className="text-red-500 text-xs mt-1 ml-1" aria-live="polite">姓名不能为空</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="age">年龄</label>
                  <input
                    className="block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100"
                    id="age"
                    placeholder="25"
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="occupation">职业</label>
                  <input
                    className="block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100"
                    id="occupation"
                    placeholder="如: 设计师"
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 居住环境 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">home</span>
              <h2 className="text-lg font-bold text-gray-900">居住环境</h2>
            </div>
            <div className="p-5 rounded-xl bg-white shadow-sm space-y-6 border border-gray-100">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500">住房情况</label>
                <div className="grid grid-cols-2 gap-3">
                  {['自有住房', '租房'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setHousingType(option)}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                        housingType === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'bg-gray-50 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="material-icons-round text-sm mr-2">{option === '自有住房' ? 'key' : 'real_estate_agent'}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500">居住状态</label>
                <div className="grid grid-cols-2 gap-3">
                  {['独居', '合租/同住'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLivingStatus(option)}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                        livingStatus === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'bg-gray-50 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="material-icons-round text-sm mr-2">{option === '独居' ? 'person_outline' : 'groups'}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 养宠经验 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">pets</span>
              <h2 className="text-lg font-bold text-gray-900">养宠经验</h2>
            </div>
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex">
              {[{ label: '有经验', value: true }, { label: '无经验', value: false }].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setHasExperience(opt.value)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    hasExperience === opt.value
                      ? 'bg-primary text-black shadow-lg shadow-primary/20'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  aria-pressed={hasExperience === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* AI 匹配问卷（扩展字段） */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">psychology</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">AI 匹配问卷</h2>
            </div>
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 shadow-sm space-y-5 border border-gray-100 dark:border-zinc-700">

              {/* 住宅面积 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-zinc-400">住宅面积</label>
                <div className="flex gap-2">
                  {['<50㎡', '50-100㎡', '>100㎡'].map(opt => (
                    <button key={opt} type="button" onClick={() => setHomeSize(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                        homeSize === opt ? 'border-primary bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-zinc-700 border-transparent text-gray-600 dark:text-zinc-300'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* 每日陪伴时间 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-zinc-400">
                  每天可陪伴时间：<span className="text-primary font-bold">{dailyFreeHours} 小时</span>
                </label>
                <input
                  type="range" min={1} max={12} step={1}
                  value={dailyFreeHours}
                  onChange={e => setDailyFreeHours(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500">
                  <span>1h</span><span>6h</span><span>12h</span>
                </div>
              </div>

              {/* 每月预算 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-zinc-400">每月养宠预算</label>
                <div className="flex gap-2">
                  {['<500', '500-1000', '>1000'].map(opt => (
                    <button key={opt} type="button" onClick={() => setMonthlyBudget(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                        monthlyBudget === opt ? 'border-primary bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-zinc-700 border-transparent text-gray-600 dark:text-zinc-300'
                      }`}>{opt} 元</button>
                  ))}
                </div>
              </div>

              {/* 工作方式 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-zinc-400">工作方式</label>
                <div className="flex gap-2">
                  {['远程', '通勤', '不规律'].map(opt => (
                    <button key={opt} type="button" onClick={() => setWorkStyle(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                        workStyle === opt ? 'border-primary bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-zinc-700 border-transparent text-gray-600 dark:text-zinc-300'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* 过敏史 & 其他宠物 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '有过敏史', value: hasAllergy, setter: setHasAllergy },
                  { label: '家中有其他宠物', value: hasOtherPets, setter: setHasOtherPets },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between bg-gray-50 dark:bg-zinc-700 rounded-xl px-3 py-2.5">
                    <span className="text-sm text-gray-600 dark:text-zinc-300">{item.label}</span>
                    <button type="button" role="switch" aria-checked={item.value}
                      onClick={() => item.setter(v => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${item.value ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-500'}`}>
                      <span className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.value ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 申请寄语 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">favorite</span>
              <h2 className="text-lg font-bold text-gray-900">申请寄语<span className="text-red-500">*</span></h2>
            </div>
            <div className="relative">
              <textarea
                className={`block w-full px-4 py-4 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ${
                  message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH ? 'ring-red-300' : 'ring-gray-100'
                } resize-none`}
                id="message"
                placeholder="请告诉我们您为什么要领养，以及您能为它提供什么样的生活环境..."
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                required
                aria-required="true"
              />
              {message.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1 ml-1" aria-live="polite">申请寄语不能为空</p>
              )}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20" role="alert">
              <span className="material-icons-round text-primary text-sm mt-0.5">info</span>
              <p className="text-xs text-primary/90 leading-relaxed">
                为了确保宠物能找到负责任的主人，我们会对您的信息进行严格审核。提交即代表您同意我们的隐私政策。
              </p>
            </div>
          </section>

          {/* AI 匹配评分区域 */}
          <section className="space-y-4">
            {matchScore && <MatchScoreCard score={matchScore} />}
            {scoreRefining && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                AI 正在后台精修评分，你可以继续填写并提交申请
              </div>
            )}
            <button
              type="button"
              onClick={handleGetMatchScore}
              disabled={scoreTaskRunning || !pet}
              className="w-full py-3.5 rounded-xl border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/10 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {scoreTaskRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  任务提交中…
                </>
              ) : scoreRefining ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  后台精修中…
                </>
              ) : (
                <>
                  <span className="material-icons-round text-base">auto_awesome</span>
                  {matchScore ? '重新发起积分评估' : '发起积分评估（后台通知）'}
                </>
              )}
            </button>
          </section>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto w-full">
          <button
            onClick={handleSubmit}
            className={`w-full bg-primary text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center space-x-2 ${
              !isFormValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4dd625] active:scale-[0.98]'
            }`}
            disabled={!isFormValid || isLoading}
            aria-disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-white rounded-full animate-spin mr-2"></div>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span>提交申请</span>
                <span className="material-icons-round text-base">send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdoptionForm;
