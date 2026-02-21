import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import { fetchProductById, purchasePolicy } from '../lib/api/insurance';
import { fetchAdoptedPets } from '../lib/api/pets';
import type { InsuranceProduct, Pet } from '../types';

const InsuranceProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState<InsuranceProduct | null>(null);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, pets] = await Promise.all([fetchProductById(id), fetchAdoptedPets(user.id)]);
        setProduct(p ?? null);
        setMyPets(pets);
        if (pets.length > 0 && !selectedPetId) setSelectedPetId(pets[0].id);
      } catch (err) {
        showToast(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, id, showToast]);

  const points = profile?.points ?? 0;
  const maxPointsDiscountYuan = product
    ? Math.min(product.premiumYuan, Math.floor(points / product.pointsPerYuan))
    : 0;
  const maxPointsToUse = maxPointsDiscountYuan * (product?.pointsPerYuan ?? 10);
  const actualPointsToUse = Math.min(pointsToUse, maxPointsToUse);
  const discountYuan = product ? Math.floor(actualPointsToUse / product.pointsPerYuan) : 0;
  const finalPremiumYuan = product ? product.premiumYuan - discountYuan : 0;

  const handlePurchase = async () => {
    if (!product || !user || !selectedPetId) {
      showToast('请选择要投保的宠物');
      return;
    }
    setSubmitting(true);
    try {
      await purchasePolicy({
        userId: user.id,
        petId: selectedPetId,
        productId: product.id,
        pointsToUse: actualPointsToUse,
      });
      await refreshProfile();
      showToast('投保成功！');
      navigate('/insurance', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '投保失败';
      if (msg.includes('INSUFFICIENT_POINTS')) showToast('积分不足');
      else showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/insurance', { replace: true });
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  return (
    <div className="pb-36 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97]"
            aria-label="返回"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-200">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{product.name}</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-5">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="material-icons-round text-white text-2xl">shield</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{product.name}</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">年保费 ¥{product.premiumYuan} · 保额 ¥{product.coverageAmount.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{product.description}</p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3">选择宠物</h3>
          {myPets.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-zinc-400">暂无领养宠物，请先完成领养</p>
          ) : (
            <div className="space-y-2">
              {myPets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedPetId === pet.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 dark:border-zinc-700'
                  }`}
                >
                  <img
                    src={pet.imageUrl || '/placeholder-pet.png'}
                    alt={pet.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-zinc-100">{pet.name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{pet.breed} · {pet.age}</p>
                  </div>
                  {selectedPetId === pet.id && (
                    <span className="material-icons-round text-primary">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3">积分抵扣</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
            {product.pointsPerYuan} 积分 = 1 元，最多可抵 ¥{maxPointsDiscountYuan}
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={maxPointsToUse}
              step={product.pointsPerYuan}
              value={actualPointsToUse}
              onChange={(e) => setPointsToUse(parseInt(e.target.value, 10) || 0)}
              className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-zinc-700 appearance-none accent-primary"
            />
            <span className="text-sm font-bold text-primary w-16">{actualPointsToUse} 积分</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            抵扣 ¥{discountYuan}，实付 ¥{finalPremiumYuan}
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-24 pt-4 z-30 bg-gradient-to-t from-gray-50 dark:from-zinc-900 via-gray-50/95 dark:via-zinc-900/95 to-transparent">
        <button
          onClick={handlePurchase}
          disabled={!selectedPetId || myPets.length === 0 || submitting}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl active:scale-[0.97] transition-all ${
            selectedPetId && myPets.length > 0 && !submitting
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-icons-round animate-spin">refresh</span>投保中…
            </span>
          ) : (
            `立即投保 · 实付 ¥${finalPremiumYuan}${actualPointsToUse > 0 ? `（已抵 ${actualPointsToUse} 积分）` : ''}`
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default InsuranceProductDetail;
