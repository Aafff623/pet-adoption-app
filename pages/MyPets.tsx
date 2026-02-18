import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAdoptedPets } from '../lib/api/pets';
import type { Pet } from '../types';

const MyPets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const pets = await fetchAdoptedPets(user.id);
        setMyPets(pets);
      } catch (err) {
        console.error('加载我的宠物失败', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">我的宠物</h1>
        <div className="flex-1"></div>
        <button className="text-primary text-sm font-bold" aria-label="添加宠物">添加</button>
      </header>

      <main className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 h-28 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : myPets.length > 0 ? (
          myPets.map(pet => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/pet/${pet.id}`)}
              role="listitem"
              aria-label={`我的宠物：${pet.name}，品种：${pet.breed}`}
            >
              <img src={pet.imageUrl} alt={pet.name} className="w-20 h-20 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.breed}</p>
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已领养</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-icons-round text-6xl mb-4 text-gray-200">sentiment_dissatisfied</span>
            <p>您还没有领养任何宠物哦</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              去领养
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPets;
