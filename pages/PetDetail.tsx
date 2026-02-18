import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPetById } from '../lib/api/pets';
import { addFavorite, removeFavorite, checkIsFavorited } from '../lib/api/favorites';
import { createOrFindConversation } from '../lib/api/messages';
import { useAuth } from '../contexts/AuthContext';
import type { Pet } from '../types';

const PET_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='62' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E`;

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.onerror = null;
  target.src = PET_PLACEHOLDER;
};

interface PetDetailProps {
  showToast: (message: string) => void;
}

const PetDetail: React.FC<PetDetailProps> = ({ showToast }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadPet = async () => {
      setLoading(true);
      try {
        const [foundPet, favorited] = await Promise.all([
          fetchPetById(id),
          user ? checkIsFavorited(user.id, id) : Promise.resolve(false),
        ]);
        setPet(foundPet);
        setIsFavorited(favorited);
      } catch (err) {
        console.error('加载宠物详情失败', err);
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [id, user]);

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
    } catch (err) {
      console.error('创建会话失败', err);
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
      <div className="min-h-screen bg-background-light flex items-center justify-center fade-in">
        <span className="material-icons text-[#60e750] text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center fade-in">
        <div className="text-center">
          <p className="text-gray-500 mb-4">未找到该宠物信息</p>
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
    <div className="bg-background-light min-h-screen relative flex flex-col fade-in">
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
        </div>

        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover bg-gray-100" onError={handleImgError} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-10">
          <div className="w-6 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 backdrop-blur-sm"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 backdrop-blur-sm"></div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="relative flex-1 -mt-8 bg-white rounded-t-3xl px-6 pt-8 pb-32 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto">
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-200"></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{pet.name}</h1>
            <div className="flex items-center text-gray-500 text-sm font-medium">
              <span className="material-icons-round text-primary text-base mr-1">location_on</span>
              <span className="mr-2">{pet.location}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
              <span>距离 {pet.distance}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">{pet.price === 0 ? '免费' : `¥${pet.price}`}</span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">领养费</span>
          </div>
        </div>

        {/* 基础信息 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">年龄</span>
            <span className="text-gray-800 font-bold text-lg">{pet.age}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">性别</span>
            <span className="text-gray-800 font-bold text-lg">{pet.gender === 'male' ? '公' : '母'}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">体重</span>
            <span className="text-gray-800 font-bold text-lg">{pet.weight}</span>
          </div>
        </div>

        {/* 寄养家庭 */}
        {pet.fosterParent && (
          <div className="flex items-center mb-8 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <img src={pet.fosterParent.avatar} alt={pet.fosterParent.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary bg-gray-100" onError={handleImgError} />
            <div className="ml-3 flex-1">
              <h3 className="text-gray-900 font-bold text-sm">{pet.fosterParent.name}</h3>
              <p className="text-gray-500 text-xs">寄养家庭</p>
            </div>
            <button className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-primary transition-colors" aria-label={`联系寄养家庭 ${pet.fosterParent.name}`}>
              <span className="material-icons-round text-xl">phone</span>
            </button>
          </div>
        )}

        {/* 故事 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">TA的故事</h2>
          <p className={`text-gray-600 leading-relaxed text-sm transition-all ${storyExpanded ? '' : 'line-clamp-3'}`}>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">健康状况</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'vaccines', label: '疫苗', value: pet.health.vaccines },
                { icon: 'content_cut', label: '绝育', value: pet.health.neuter },
                { icon: 'verified', label: '芯片', value: pet.health.chip },
                { icon: 'pets', label: '训练', value: pet.health.training },
              ].map(item => (
                <div key={item.label} className="flex items-center p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-primary">
                    <span className="material-icons-round text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">{item.label}</p>
                    <p className="text-primary text-xs">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 flex gap-4 items-center shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <button
          onClick={handleChat}
          disabled={chatLoading}
          className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors group disabled:opacity-50"
          aria-label="联系寄养家庭"
        >
          {chatLoading ? (
            <span className="material-icons-round text-primary text-2xl animate-spin">refresh</span>
          ) : (
            <span className="material-icons-round text-gray-400 group-hover:text-primary text-2xl transition-colors">chat_bubble_outline</span>
          )}
        </button>
        <button
          onClick={() => navigate(`/adopt?petId=${pet.id}`)}
          className="flex-1 h-14 rounded-2xl bg-primary hover:bg-green-500 text-white font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="立即申请领养"
        >
          <span>立即申请</span>
          <span className="material-icons-round text-xl">pets</span>
        </button>
      </div>
    </div>
  );
};

export default PetDetail;
