import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RESEND_COOLDOWN = 60;

const BindPhone: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const existingPhone = user?.phone ?? '';

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBack = () => {
    if (step === 'verify') {
      setStep('phone');
      setCode('');
      setErrorMsg('');
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const isValidPhone = (p: string) => /^1[3-9]\d{9}$/.test(p);

  const handleSendCode = async () => {
    setErrorMsg('');
    if (!isValidPhone(phone)) {
      setErrorMsg('请输入正确的手机号码');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep('verify');
      startCountdown();
    } catch {
      setErrorMsg('发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setErrorMsg('');
    if (code.length !== 6) {
      setErrorMsg('请输入6位验证码');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccessMsg('手机号绑定成功！');
      setTimeout(() => navigate('/settings'), 1500);
    } catch {
      setErrorMsg('验证码错误，请重新输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">绑定手机</h1>
      </header>

      <main className="p-6">
        {existingPhone && (
          <div className="mb-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <span className="material-icons-round text-primary text-2xl">phone_android</span>
            <div>
              <p className="text-xs text-gray-500">当前绑定手机</p>
              <p className="text-sm font-semibold text-gray-800">
                {existingPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
            <span className="material-icons-round text-base">error_outline</span>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
            <span className="material-icons-round text-base">check_circle</span>
            {successMsg}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
              <label className="text-sm font-medium text-gray-600" htmlFor="phone-input">
                手机号码
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 whitespace-nowrap">
                  +86
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={!isValidPhone(phone) || loading}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
              {loading ? '发送中...' : '获取验证码'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2">
              <p className="text-sm text-gray-500">
                验证码已发送至 <span className="font-semibold text-gray-800">{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
              </p>
              <label className="text-sm font-medium text-gray-600 block mt-2" htmlFor="code-input">
                验证码
              </label>
              <input
                id="code-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 text-center text-xl tracking-[0.5em]"
                placeholder="------"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-400">{countdown}秒后可重新发送</p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-sm text-primary font-medium"
                >
                  重新发送验证码
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
              {loading ? '验证中...' : '确认绑定'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BindPhone;
