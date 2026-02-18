import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { fetchFavoritePets, removeFavorite } from '../lib/api/favorites';
import type { Pet } from '../types';

interface FavoritesProps {
  showToast: (message: string) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ showToast }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavoritePets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const pets = await fetchFavoritePets(user.id);
      setFavoritePets(pets);
    } catch (err) {
      console.error('加载收藏列表失败', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavoritePets();
  }, [loadFavoritePets]);

  const handleRemoveFavorite = async (petId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user || removingId) return;

    setRemovingId(petId);
    try {
      await removeFavorite(user.id, petId);
      setFavoritePets(prev => prev.filter(p => p.id !== petId));
      showToast('已取消收藏');
    } catch {
      showToast('操作失败，请重试');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in pb-24">
      <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">我的收藏</h1>
        <p className="text-sm text-gray-500 mt-1">您关注的毛孩子都在这里</p>
      </header>

      <main className="px-6 space-y-4">
        {loading ? (
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-3 flex gap-4 h-28 animate-pulse">
                <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : favoritePets.length > 0 ? (
          favoritePets.map(pet => (
            <div
              key={pet.id}
              onClick={() => navigate(`/pet/${pet.id}`)}
              className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
              role="listitem"
              aria-label={`收藏的宠物：${pet.name}，品种：${pet.breed}`}
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                    <button
                      onClick={e => handleRemoveFavorite(pet.id, e)}
                      disabled={removingId === pet.id}
                      className="text-red-500 material-icons-round p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-40"
                      aria-label={`取消收藏 ${pet.name}`}
                    >
                      favorite
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{pet.breed}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="material-icons-round text-sm">location_on</span>
                  <span>{pet.distance}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-icons-round text-6xl mb-4 text-gray-200">favorite_border</span>
            <p>还没有收藏任何宠物哦</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              去发现
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Favorites;
