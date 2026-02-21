import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import {
  fetchInsuranceProducts,
  fetchMyPolicies,
  fetchRecommendedProducts,
} from '../lib/api/insurance';
import { fetchAdoptedPets } from '../lib/api/pets';
import type { InsuranceProduct, InsurancePolicyWithDetails, Pet } from '../types';

const InsuranceCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicyWithDetails[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const tabParam = searchParams.get('tab');
  const defaultTab: 'recommend' | 'all' | 'my' = 
    tabParam === 'my' || tabParam === 'all' ? tabParam : 'recommend';
  const [activeTab, setActiveTab] = useState<'recommend' | 'all' | 'my'>(defaultTab);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [allProducts, myPolicies, pets] = await Promise.all([
          fetchInsuranceProducts(),
          fetchMyPolicies(user.id),
          fetchAdoptedPets(user.id),
        ]);
        setProducts(allProducts);
        setPolicies(myPolicies);
        setMyPets(pets);
      } catch (err) {
        showToast(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const recommendedProducts =
    myPets.length > 0 && myPets[0]
      ? products.filter(p => {
          const ageText = myPets[0].age ?? '';
          const yearMatch = ageText.match(/(\d+)\s*岁/);
          const monthMatch = ageText.match(/(\d+)\s*个?月/);
          let ageMonths: number | null = null;
          if (yearMatch) ageMonths = parseInt(yearMatch[1], 10) * 12;
          else if (monthMatch) ageMonths = parseInt(monthMatch[1], 10);
          if (ageMonths != null) {
            if (ageMonths < p.minAgeMonths) return false;
            if (p.maxAgeMonths != null && ageMonths > p.maxAgeMonths) return false;
          }
          return true;
        })
      : products;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/points', { replace: true });
  };

  const handleProductClick = (product: InsuranceProduct) => {
    navigate(`/insurance/product/${product.id}`);
  };

  const handlePolicyClick = (policy: InsurancePolicyWithDetails) => {
    navigate(`/insurance/claim/${policy.id}`);
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { active: '生效中', expired: '已过期', cancelled: '已取消' };
    return map[s] ?? s;
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    if (s === 'expired') return 'bg-gray-200 dark:bg-zinc-600 text-gray-600 dark:text-zinc-400';
    return 'bg-gray-200 dark:bg-zinc-600 text-gray-500 dark:text-zinc-500';
  };

  return (
    <div className="pb-32 fade-in min-h-screen bg-gray-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-40 bg-gray-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97]"
            aria-label="返回"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-200">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">宠物险与健康保障</h1>
        </div>
        <div className="flex gap-2 px-4 pb-3">
          {(['recommend', 'all', 'my'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
              }`}
            >
              {tab === 'recommend' ? '推荐' : tab === 'all' ? '全部险种' : '我的保单'}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
          </div>
        ) : activeTab === 'my' ? (
          <div className="space-y-3">
            {policies.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
                <span className="material-icons-round text-5xl mb-2">folder_off</span>
                <p>暂无保单</p>
                <p className="text-sm mt-1">为爱宠投保，守护健康</p>
                <button
                  onClick={() => setActiveTab('recommend')}
                  className="mt-4 px-6 py-2 rounded-full bg-primary text-white text-sm font-medium"
                >
                  去投保
                </button>
              </div>
            ) : (
              policies.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePolicyClick(p)}
                  className="w-full bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm text-left hover:shadow-md active:scale-[0.99] transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900 dark:text-zinc-100">{p.productName ?? '险种'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">宠物：{p.petName ?? '—'}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                    保障至 {new Date(p.endAt).toLocaleDateString('zh-CN')}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-primary text-sm">
                    <span>申请理赔</span>
                    <span className="material-icons-round text-base">chevron_right</span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'recommend' ? recommendedProducts : products).map((p) => (
              <button
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="w-full bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm text-left hover:shadow-md active:scale-[0.99] transition-all flex items-stretch gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-white text-2xl">shield</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-zinc-100">{p.name}</span>
                    {p.category !== 'all' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        {p.category === 'dog' ? '犬' : p.category === 'cat' ? '猫' : '其他'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{p.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">¥{p.premiumYuan}</span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500">/年</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">保额 ¥{p.coverageAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    积分可抵扣 · {p.pointsPerYuan} 积分/元
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="material-icons-round text-gray-300 dark:text-zinc-600">chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default InsuranceCenter;
