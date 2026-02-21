import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'login' | 'register';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nickname: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginForm.email || !loginForm.password) {
      setErrorMsg('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    const { error } = await login(loginForm.email, loginForm.password);
    setLoading(false);
    if (error) {
      setErrorMsg('邮箱或密码错误，请重试');
      return;
    }
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect') ?? '/';
    navigate(redirect, { replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!registerForm.nickname || !registerForm.email || !registerForm.password) {
      setErrorMsg('请填写所有必填项');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    if (registerForm.password.length < 6) {
      setErrorMsg('密码长度至少 6 位');
      return;
    }
    setLoading(true);
    const { error } = await register(registerForm.email, registerForm.password, registerForm.nickname);
    setLoading(false);
    if (error) {
      setErrorMsg('注册失败，该邮箱可能已被注册');
      return;
    }
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect') ?? '/';
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col">
      {/* 顶部品牌区 */}
      <div className="bg-white dark:bg-zinc-800 pt-16 pb-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-md">
          <span className="material-icons text-white text-4xl">pets</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">PetConnect</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">为每一只宠物找到温暖的家</p>
      </div>

      {/* 标签切换 */}
      <div className="bg-white dark:bg-zinc-800 mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-zinc-700">
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          >
            登录
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === 'register' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 dark:text-zinc-500'
            }`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
          >
            注册
          </button>
        </div>

        <div className="p-6">
          {/* 错误提示 */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* 登录表单 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">邮箱</label>
                <input
                  type="email"
                  placeholder="请输入邮箱"
                  value={loginForm.email}
                  onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">密码</label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={loginForm.password}
                  onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-black rounded-xl font-medium text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">昵称</label>
                <input
                  type="text"
                  placeholder="请输入昵称"
                  value={registerForm.nickname}
                  onChange={e => setRegisterForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">邮箱</label>
                <input
                  type="email"
                  placeholder="请输入邮箱"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">密码</label>
                <input
                  type="password"
                  placeholder="至少 6 位"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-1">确认密码</label>
                <input
                  type="password"
                  placeholder="再次输入密码"
                  value={registerForm.confirmPassword}
                  onChange={e => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm outline-none focus:border-primary transition-colors text-gray-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-black rounded-xl font-medium text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="material-icons text-sm animate-spin">refresh</span>}
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6 px-8">
        注册即表示同意《用户服务协议》和《隐私政策》
      </p>
    </div>
  );
};

export default Login;
