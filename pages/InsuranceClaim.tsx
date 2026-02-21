import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import BottomNav from '../components/BottomNav';
import {
  fetchPolicyById,
  fetchClaimsByPolicy,
  submitClaim,
  getHealthDiaryRiskHint,
} from '../lib/api/insurance';
import { uploadImage } from '../lib/utils/storage';
import type { InsurancePolicyWithDetails, InsuranceClaim } from '../types';

const CLAIM_STATUS_MAP: Record<string, string> = {
  pending: '待审核',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '已驳回',
};

const InsuranceClaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [policy, setPolicy] = useState<InsurancePolicyWithDetails | null>(null);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [riskHint, setRiskHint] = useState<{ hasRecords: boolean; symptomCount: number } | null>(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, claimList] = await Promise.all([
          fetchPolicyById(id, user.id),
          fetchClaimsByPolicy(id, user.id),
        ]);
        setPolicy(p ?? null);
        setClaims(claimList);
        if (p) {
          const h = await getHealthDiaryRiskHint(p.petId).catch(() => null);
          setRiskHint(h);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, id, showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!policy || !user) return;
    const amount = parseInt(claimAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      showToast('请输入有效理赔金额');
      return;
    }
    if (amount > policy.premiumYuan * 10) {
      showToast('理赔金额超出合理范围');
      return;
    }
    if (!description.trim()) {
      showToast('请填写理赔说明');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage('health-diary-images', user.id, imageFile);
      }
      await submitClaim(
        {
          policyId: policy.id,
          petId: policy.petId,
          claimAmountYuan: amount,
          description: description.trim(),
          medicalImageUrl: imageUrl,
        },
        user.id
      );
      showToast('理赔申请已提交');
      const updated = await fetchClaimsByPolicy(policy.id, user.id);
      setClaims(updated);
      setClaimAmount('');
      setDescription('');
      handleRemoveImage();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/insurance', { replace: true });
  };

  if (loading || !policy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (policy.status !== 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 px-6">
        <span className="material-icons-round text-6xl text-gray-400 dark:text-zinc-500 mb-4">info</span>
        <p className="text-gray-600 dark:text-zinc-400 text-center">该保单已失效，无法申请理赔</p>
        <button
          onClick={handleBack}
          className="mt-6 px-6 py-2 rounded-full bg-primary text-white font-medium"
        >
          返回
        </button>
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
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">申请理赔</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-5">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-zinc-400">保单</p>
          <p className="font-bold text-gray-900 dark:text-zinc-100">{policy.productName}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">宠物：{policy.petName}</p>
        </div>

        {riskHint && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <span className="material-icons-round text-base">health_and_safety</span>
              健康日记风控
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              {riskHint.hasRecords
                ? `近期有健康记录，${riskHint.symptomCount > 0 ? `其中 ${riskHint.symptomCount} 条含症状` : '无异常症状'}`
                : '暂无健康日记记录'}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3">理赔信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-zinc-400 mb-1">理赔金额（元）</label>
              <input
                type="number"
                min={1}
                max={policy.premiumYuan * 10}
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="请输入金额"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-zinc-400 mb-1">理赔说明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请描述就医情况、诊断结果等"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-zinc-400 mb-1">病历照片（选填）</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="预览"
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-zinc-600"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    aria-label="删除"
                  >
                    <span className="material-icons-round text-sm">close</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-icons-round text-3xl">add_photo_alternate</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {claims.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3">历史理赔</h3>
            <div className="space-y-2">
              {claims.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">¥{c.claimAmountYuan}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{new Date(c.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : c.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {CLAIM_STATUS_MAP[c.status] ?? c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-24 pt-4 z-30 bg-gradient-to-t from-gray-50 dark:from-zinc-900 via-gray-50/95 dark:via-zinc-900/95 to-transparent">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl active:scale-[0.97] transition-all ${
            !submitting
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-icons-round animate-spin">refresh</span>提交中…
            </span>
          ) : (
            '提交理赔申请'
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default InsuranceClaim;
