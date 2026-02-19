import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchVerification, submitVerification } from '../lib/api/verification';
import type { Verification as VerificationType } from '../types';

const maskName = (name: string): string => {
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
};

/** 使用 last4 展示脆敏号码 */
const maskIdDisplay = (last4?: string | null, legacyIdNumber?: string | null): string => {
  if (last4) return `****${last4}`;
  if (legacyIdNumber && legacyIdNumber.length > 4) {
    return legacyIdNumber.slice(0, 4) + '*'.repeat(legacyIdNumber.length - 8) + legacyIdNumber.slice(-4);
  }
  return '****';
};

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [realName, setRealName] = useState('');
  const [idType, setIdType] = useState('居民身份证');
  const [idNumber, setIdNumber] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchVerification(user.id);
        setVerification(data);
        if (!data) setShowForm(true);
      } catch {
        showToast('加载认证信息失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!realName.trim() || !idNumber.trim()) {
      setErrorMsg('请填写完整信息');
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      await submitVerification(user.id, realName.trim(), idType, idNumber.trim());
      const updated = await fetchVerification(user.id);
      setVerification(updated);
      setShowForm(false);
      setSuccessMsg('认证信息已提交，请等待审核');
    } catch {
      setErrorMsg('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center fade-in">
        <span className="material-icons text-[#60e750] text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">实名认证</h1>
      </header>

      <main className="p-6 space-y-6">
        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {successMsg}
          </div>
        )}

        {/* 已有认证记录 */}
        {verification && !showForm && (
          <>
            <div className={`rounded-2xl p-6 text-white shadow-lg ${
              verification.status === 'approved'
                ? 'bg-gradient-to-r from-green-400 to-primary shadow-primary/30'
                : verification.status === 'pending'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-orange-200'
                : 'bg-gradient-to-r from-red-400 to-red-500'
            }`} role="status">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-icons-round text-2xl">
                    {verification.status === 'approved' ? 'verified_user' : verification.status === 'pending' ? 'hourglass_empty' : 'error_outline'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {verification.status === 'approved' ? '已通过实名认证' : verification.status === 'pending' ? '审核中' : '认证未通过'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {verification.status === 'approved' ? '您的身份信息已核验' : verification.status === 'pending' ? '请等待 1-3 个工作日' : '请重新提交'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">真实姓名</span>
                <span className="font-medium text-gray-900">{maskName(verification.realName)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">证件类型</span>
                <span className="font-medium text-gray-900">{verification.idType}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">证件号码</span>
                <span className="font-medium text-gray-900">{maskIdDisplay(verification.idNumberLast4, verification.idNumber)}</span>
              </div>
            </div>

            {verification.status === 'rejected' && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20"
              >
                重新提交
              </button>
            )}
          </>
        )}

        {/* 提交表单 */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-2">
              <span className="material-icons-round text-yellow-600 text-sm mt-0.5">info</span>
              <p className="text-xs text-yellow-700">请填写真实有效的证件信息，用于领养资格审核，信息将严格保密。</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="realName">
                真实姓名<span className="text-red-500">*</span>
              </label>
              <input
                id="realName"
                type="text"
                placeholder="请输入真实姓名"
                value={realName}
                onChange={e => setRealName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#60e750]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1">证件类型</label>
              <select
                value={idType}
                onChange={e => setIdType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#60e750]"
              >
                <option>居民身份证</option>
                <option>港澳居民来往内地通行证</option>
                <option>台湾居民来往大陆通行证</option>
                <option>护照</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="idNumber">
                证件号码<span className="text-red-500">*</span>
              </label>
              <input
                id="idNumber"
                type="text"
                placeholder="请输入证件号码"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#60e750]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !realName.trim() || !idNumber.trim()}
              className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="material-icons text-sm animate-spin">refresh</span>}
              {isSubmitting ? '提交中...' : '提交认证'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Verification;
