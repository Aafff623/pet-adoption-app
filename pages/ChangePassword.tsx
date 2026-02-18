import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return '密码不能少于8位';
    if (!/[A-Za-z]/.test(pwd)) return '密码需包含字母';
    if (!/[0-9]/.test(pwd)) return '密码需包含数字';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('请输入当前密码');
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setErrorMsg(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('两次输入的新密码不一致');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('新密码不能与当前密码相同');
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email;

      if (!email) {
        setErrorMsg('无法获取用户信息，请重新登录');
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        setErrorMsg('当前密码不正确');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMsg('修改失败：' + error.message);
      } else {
        setSuccessMsg('密码修改成功！');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/settings'), 1500);
      }
    } catch {
      setErrorMsg('操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const newPasswordError = validatePassword(newPassword);
  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !newPasswordError &&
    newPassword === confirmPassword;

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
        <h1 className="text-lg font-bold text-gray-900 ml-2">修改密码</h1>
      </header>

      <main className="p-6">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600" htmlFor="current-password">
                当前密码
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 pr-12 border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900"
                  placeholder="请输入当前密码"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrent(v => !v)}
                  aria-label={showCurrent ? '隐藏密码' : '显示密码'}
                >
                  <span className="material-icons-round text-xl">
                    {showCurrent ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600" htmlFor="new-password">
                新密码
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 pr-12 border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900"
                  placeholder="至少8位，含字母和数字"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNew(v => !v)}
                  aria-label={showNew ? '隐藏密码' : '显示密码'}
                >
                  <span className="material-icons-round text-xl">
                    {showNew ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {newPassword.length > 0 && newPasswordError && (
                <p className="text-xs text-red-500 mt-1">{newPasswordError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600" htmlFor="confirm-password">
                确认新密码
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 pr-12 border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900"
                  placeholder="再次输入新密码"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? '隐藏密码' : '显示密码'}
                >
                  <span className="material-icons-round text-xl">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">两次密码不一致</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
            <span className="material-icons-round text-blue-400 text-base mt-0.5">info</span>
            <p className="text-xs text-blue-600">密码至少8位，需同时包含字母和数字。修改后将自动跳回设置页。</p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={!isFormValid || loading}
          >
            {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
            {loading ? '修改中...' : '确认修改'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ChangePassword;
