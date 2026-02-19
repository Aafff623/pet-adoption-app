import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPetById } from '../lib/api/pets';
import { fetchUserApplicationForPet } from '../lib/api/adoption';
import { addFavorite, removeFavorite, checkIsFavorited } from '../lib/api/favorites';
import { createOrFindConversation } from '../lib/api/messages';
import { submitReport } from '../lib/api/reports';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Pet, AdoptionApplication } from '../types';

const PET_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='62' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E`;

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = PET_PLACEHOLDER;
};

const PetDetail: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [userApplication, setUserApplication] = useState<AdoptionApplication | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadPet = async () => {
      setLoading(true);
      try {
        const [foundPet, favorited, application] = await Promise.all([
          fetchPetById(id),
          user ? checkIsFavorited(user.id, id) : Promise.resolve(false),
          user && id ? fetchUserApplicationForPet(user.id, id) : Promise.resolve(null),
        ]);
        setPet(foundPet);
        setIsFavorited(favorited);
        setUserApplication(application ?? null);
      } catch {
        showToast('加载宠物详情失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [id, user, showToast]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleChat = async () => {
    if (!pet) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setChatLoading(true);
    try {
      const conversationId = await createOrFindConversation(
        user.id,
        pet.fosterParent?.name ?? pet.name,
        pet.fosterParent?.avatar ?? ''
      );
      navigate(`/chat/${conversationId}`);
    } catch {
      showToast('发起聊天失败，请重试');
    } finally {
      setChatLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!pet) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(user.id, pet.id);
        showToast('已取消收藏');
      } else {
        await addFavorite(user.id, pet.id);
        showToast('已收藏');
      }
      setIsFavorited(prev => !prev);
    } catch {
      showToast('操作失败，请重试');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center fade-in">
        <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center fade-in">
        <div className="text-center">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">未找到该宠物信息</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-black rounded-full font-bold shadow-lg shadow-primary/20"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen relative flex flex-col fade-in">
      {/* 顶部图片 */}
      <div className="relative h-[45vh] w-full shrink-0">
        <div className="absolute top-0 left-0 right-0 z-[100] pt-8 px-6 flex justify-between items-center text-white pointer-events-none">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 transition-colors pointer-events-auto active:scale-95 cursor-pointer"
            aria-label="返回上一页"
          >
            <span className="material-icons-round text-2xl">arrow_back</span>
          </button>
          <button
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 transition-colors group pointer-events-auto active:scale-95 cursor-pointer disabled:opacity-50"
            aria-label={isFavorited ? '取消收藏' : '收藏'}
          >
            <span className={`material-icons-round text-2xl ${isFavorited ? 'text-red-500' : 'group-hover:text-red-500 transition-colors'}`}>
              {isFavorited ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          <button
            onClick={() => setShowReportSheet(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 transition-colors pointer-events-auto active:scale-95 cursor-pointer"
            aria-label="举报该宠物"
          >
            <span className="material-icons-round text-white text-xl">flag</span>
          </button>
        </div>

        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover bg-gray-100 dark:bg-zinc-800" onError={handleImgError} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-10">
          <div className="w-6 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 backdrop-blur-sm"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 backdrop-blur-sm"></div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="relative flex-1 -mt-8 bg-white dark:bg-zinc-800 rounded-t-3xl px-6 pt-8 pb-32 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto">
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-600"></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100 mb-1">{pet.name}</h1>
            <div className="flex items-center text-gray-500 dark:text-zinc-400 text-sm font-medium">
              <span className="material-icons-round text-primary text-base mr-1">location_on</span>
              <span className="mr-2">{pet.location}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-500 mr-2"></span>
              <span>距离 {pet.distance}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">{pet.price === 0 ? '免费' : `¥${pet.price}`}</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium uppercase tracking-wide">领养费</span>
          </div>
        </div>

        {/* 基础信息 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 dark:bg-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-600">
            <span className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">年龄</span>
            <span className="text-gray-800 dark:text-zinc-200 font-bold text-lg">{pet.age}</span>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-600">
            <span className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">性别</span>
            <span className="text-gray-800 dark:text-zinc-200 font-bold text-lg">{pet.gender === 'male' ? '公' : '母'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-600">
            <span className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">体重</span>
            <span className="text-gray-800 dark:text-zinc-200 font-bold text-lg">{pet.weight}</span>
          </div>
        </div>

        {/* 寄养家庭 */}
        {pet.fosterParent && (
          <div className="flex items-center mb-8 p-3 rounded-xl bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 shadow-sm">
            <img src={pet.fosterParent.avatar} alt={pet.fosterParent.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary bg-gray-100 dark:bg-zinc-600" onError={handleImgError} />
            <div className="ml-3 flex-1">
              <h3 className="text-gray-900 dark:text-zinc-100 font-bold text-sm">{pet.fosterParent.name}</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-xs">寄养家庭</p>
            </div>
            <button
              onClick={() => setShowContactSheet(true)}
              className="p-2 rounded-lg bg-green-50 dark:bg-primary/20 hover:bg-green-100 dark:hover:bg-primary/30 text-primary transition-colors active:scale-95"
              aria-label={`联系寄养家庭 ${pet.fosterParent.name}`}
            >
              <span className="material-icons-round text-xl">phone</span>
            </button>
          </div>
        )}

        {/* 故事 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3">TA的故事</h2>
          <p className={`text-gray-600 dark:text-zinc-300 leading-relaxed text-sm transition-all ${storyExpanded ? '' : 'line-clamp-3'}`}>
            {pet.story}
          </p>
          {pet.story && pet.story.length > 80 && (
            <button
              onClick={() => setStoryExpanded(prev => !prev)}
              className="text-primary font-semibold text-sm mt-2 hover:underline active:opacity-70 transition-opacity"
              aria-label={storyExpanded ? '收起宠物故事' : '阅读更多宠物故事'}
            >
              {storyExpanded ? '收起' : '阅读更多'}
            </button>
          )}
        </div>

        {/* 健康状况 */}
        {pet.health && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4">健康状况</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'vaccines', label: '疫苗', value: pet.health.vaccines },
                { icon: 'content_cut', label: '绝育', value: pet.health.neuter },
                { icon: 'verified', label: '芯片', value: pet.health.chip },
                { icon: 'pets', label: '训练', value: pet.health.training },
              ].map(item => (
                <div key={item.label} className="flex items-center p-3 rounded-lg bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-primary/20 flex items-center justify-center mr-3 text-primary">
                    <span className="material-icons-round text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-zinc-100 text-sm font-semibold">{item.label}</p>
                    <p className="text-primary text-xs">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-700 z-50 flex gap-4 items-center shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <button
          onClick={handleChat}
          disabled={chatLoading}
          className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center border border-gray-200 dark:border-zinc-600 transition-colors group disabled:opacity-50"
          aria-label="联系寄养家庭"
        >
          {chatLoading ? (
            <span className="material-icons-round text-primary text-2xl animate-spin">refresh</span>
          ) : (
            <span className="material-icons-round text-gray-400 dark:text-zinc-500 group-hover:text-primary text-2xl transition-colors">chat_bubble_outline</span>
          )}
        </button>
        {userApplication?.status === 'approved' || pet.status === 'adopted' ? (
          <div className="flex-1 h-14 rounded-2xl bg-gray-200 dark:bg-zinc-600 text-gray-500 dark:text-zinc-400 font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed" aria-label="已领养">
            <span>已领养</span>
            <span className="material-icons-round text-xl">check_circle</span>
          </div>
        ) : userApplication?.status === 'pending' || pet.status === 'pending' ? (
          <div className="flex-1 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed" aria-label="审核中">
            <span>审核中</span>
            <span className="material-icons-round text-xl">schedule</span>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!user) { navigate('/login'); return; }
              navigate(`/adopt?petId=${pet.id}`);
            }}
            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-green-500 text-white font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="立即申请领养"
          >
            <span>立即申请</span>
            <span className="material-icons-round text-xl">pets</span>
          </button>
        )}
      </div>

      {/* 寄养家庭联系弹窗 */}
      {showContactSheet && pet.fosterParent && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowContactSheet(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
            </div>

            {/* 寄养家庭信息 */}
            <div className="flex flex-col items-center px-6 pt-4 pb-6">
              <div className="relative mb-4">
                <img
                  src={pet.fosterParent.avatar}
                  alt={pet.fosterParent.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg bg-gray-100 dark:bg-zinc-700"
                  onError={handleImgError}
                />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-white">
                  <span className="material-icons-round text-black text-xs">verified</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-1">{pet.fosterParent.name}</h3>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="bg-green-50 dark:bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-green-100 dark:border-primary/30">
                  认证寄养家庭
                </span>
              </div>
              <div className="w-full bg-gray-50 dark:bg-zinc-700 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-primary text-lg">shield</span>
                  <span>已通过平台实名认证审核</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-primary text-lg">pets</span>
                  <span>当前寄养宠物：{pet.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-primary text-lg">location_on</span>
                  <span>{pet.location || '位置未公开'}</span>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={() => { setShowContactSheet(false); handleChat(); }}
                  className="flex-1 h-12 rounded-2xl bg-primary text-black font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/30 active:scale-[0.97] transition-all"
                >
                  <span className="material-icons-round text-lg">chat_bubble_outline</span>
                  <span>发消息联系</span>
                </button>
                <button
                  onClick={() => { setShowContactSheet(false); showToast('电话功能即将上线'); }}
                  className="flex-1 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-600 active:scale-[0.97] transition-all"
                >
                  <span className="material-icons-round text-lg">phone</span>
                  <span>拨打电话</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 举报宠物弹窗 */}
      {showReportSheet && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => !reportSubmitting && setShowReportSheet(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">举报该宠物信息</h3>
            <div className="space-y-2">
              {['信息与图片不符', '疑似骗局', '重复发布', '虐待动物', '其他'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    reportReason === reason
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                      : 'bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowReportSheet(false)}
                disabled={reportSubmitting}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium disabled:opacity-50"
              >
                取消
              </button>
              <button
                disabled={!reportReason || reportSubmitting || !user}
                onClick={async () => {
                  if (!user || !pet) return;
                  setReportSubmitting(true);
                  try {
                    await submitReport({
                      reporterId: user.id,
                      targetType: 'pet',
                      targetId: pet.id,
                      reason: reportReason,
                    });
                    setShowReportSheet(false);
                    setReportReason('');
                    showToast('举报已提交，感谢你的反馈');
                  } catch {
                    showToast('提交失败，请稍后重试');
                  } finally {
                    setReportSubmitting(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {reportSubmitting ? '提交中...' : '提交举报'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetail;
