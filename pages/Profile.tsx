import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateProfile, uploadAvatar, AvatarUploadError } from '../lib/api/profile';
import { fetchApplyingCount } from '../lib/api/adoption';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgVPpxg8HIumU7EpauZP9ZlqirzBnKLdJFGK3sIDR54NKgoMvWdCpOnQkKZ8i9pqr-ZwirabrItbbt19Vsp_Ks7rywsrwksbIasOlJwu_nzBSwVNsNqNU-QjsRBwhhPM8QaaDUMMydnkQNIgx8i8vIvll48zgOHd8bQb75k7SbZ6Q_TY-_ic2MXjg2J04C-ZxWIQTqZSB2ovFoiPFZMYQSivk3XgoNPRSlgXwh6z0jYRNW1FiTPEJPxBeGSAmJTnizmRheXOoL44o';

const Profile: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();

  const [applyingCount, setApplyingCount] = useState(0);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchApplyingCount(user.id).then(setApplyingCount);
    }
  }, [user]);

  const openEditSheet = () => {
    setEditNickname(profile?.nickname ?? '');
    setEditBio(profile?.bio ?? '');
    setEditCity(profile?.city ?? '');
    setShowEditSheet(true);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      showToast('请先登录');
      return;
    }
    if (!editNickname.trim()) {
      showToast('昵称不能为空');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(user.id, {
        nickname: editNickname.trim(),
        bio: editBio.trim(),
        city: editCity.trim(),
      });
      await refreshProfile();
      setShowEditSheet(false);
      showToast('资料已更新');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '更新失败';
      showToast(msg.includes('row-level security') || msg.includes('RLS') ? '权限不足，请检查 Supabase 策略' : `更新失败：${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件（JPG、PNG、GIF 等）');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('图片不能超过 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(user.id, file);
      await refreshProfile();
      showToast('头像已更新');
    } catch (err) {
      const message = err instanceof AvatarUploadError ? err.userMessage : '上传失败，请重试';
      showToast(message);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const nickname = profile?.nickname ?? '宠物爱好者';
  const avatarUrl = profile?.avatarUrl || DEFAULT_AVATAR;
  const userId = user?.id?.slice(0, 8) ?? '--------';
  const email = user?.email ?? '';

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen pb-20 fade-in">
      <div className="relative w-full overflow-hidden bg-background-light dark:bg-zinc-900">
        <header className="relative px-6 pt-12 pb-6 flex flex-col items-center z-10">
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={openEditSheet}
              className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md active:scale-[0.95] transition-all border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-300"
              aria-label="编辑个人信息"
            >
              <span className="material-icons-round">edit</span>
            </button>
          </div>

          {/* 头像 */}
          <div className="relative mb-3">
            <button
              onClick={handleAvatarClick}
              className="relative w-28 h-28 rounded-full border-[4px] border-white dark:border-zinc-800 shadow-lg overflow-hidden group active:scale-[0.97] transition-transform"
              aria-label="更换头像"
              disabled={avatarUploading}
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-full ${
                avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {avatarUploading ? (
                  <span className="material-icons-round text-white animate-spin text-2xl">refresh</span>
                ) : (
                  <span className="material-icons-round text-white text-2xl">camera_alt</span>
                )}
              </div>
            </button>
            <div className="absolute bottom-1 right-1 bg-primary text-black rounded-full p-1 border-2 border-white dark:border-zinc-800 flex items-center justify-center shadow-sm pointer-events-none">
              <span className="material-icons-round text-[16px] font-bold">check</span>
            </div>
            <input
              ref={fileInputRef}
              id="avatar-file-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="选择头像图片"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-1 tracking-tight">{nickname}</h1>
          {profile?.bio ? (
            <p className="text-sm text-gray-500 dark:text-zinc-400 text-center px-4 mb-1">{profile.bio}</p>
          ) : null}
          <p className="text-sm text-gray-400 dark:text-zinc-500 font-display">ID: {userId}</p>
        </header>

        {/* 统计数据 */}
        <div className="px-6 mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 flex justify-between items-center shadow-sm border border-gray-100 dark:border-zinc-700">
            <div className="flex flex-col items-center flex-1 border-r border-gray-100 dark:border-zinc-700">
              <span className="text-2xl font-bold font-sans text-gray-900 dark:text-zinc-100 mb-1">{profile?.followingCount ?? 0}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">关注</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-r border-gray-100 dark:border-zinc-700">
              <span className="text-2xl font-bold font-sans text-gray-900 dark:text-zinc-100 mb-1">{applyingCount}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">申请中</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-bold font-sans text-gray-900 dark:text-zinc-100 mb-1">{profile?.adoptedCount ?? 0}</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">已领养</span>
            </div>
          </div>
        </div>

        {/* 菜单列表 */}
        <div className="px-6 space-y-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700">
            <button
              onClick={() => navigate('/my-pets')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors group border-b border-gray-50 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
                  <span className="material-icons-round">pets</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200 text-base">我的宠物</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
            </button>
            <button
              onClick={() => navigate('/verification')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
                  <span className="material-icons-round">verified_user</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200 text-base">实名认证</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700">
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors group border-b border-gray-50 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:bg-gray-200 dark:group-hover:bg-zinc-600 transition-all duration-300">
                  <span className="material-icons-round">settings</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200 text-base">设置</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
            </button>
            <button
              onClick={() => navigate('/feedback')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:bg-gray-200 dark:group-hover:bg-zinc-600 transition-all duration-300">
                  <span className="material-icons-round">feedback</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-zinc-200 text-base">意见反馈</span>
              </div>
              <span className="material-icons-round text-gray-300 dark:text-zinc-500">chevron_right</span>
            </button>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-4 text-center text-red-500 hover:text-red-600 active:scale-[0.98] text-sm font-medium transition-all bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700"
          >
            退出登录
          </button>
        </div>
      </div>

      <BottomNav />

      {/* 编辑资料底部弹层 */}
      {showEditSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget && !saving) setShowEditSheet(false); }}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* 顶部标题 */}
            <div className="flex items-center justify-between">
              <h3 id="edit-profile-title" className="text-base font-bold text-gray-900 dark:text-zinc-100">编辑资料</h3>
              <button
                onClick={() => !saving && setShowEditSheet(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors active:scale-[0.9]"
                disabled={saving}
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400 text-xl">close</span>
              </button>
            </div>

            {/* 头像（可更换）*/}
            <div className="flex flex-col items-center py-2">
              <label
                htmlFor={avatarUploading ? undefined : 'avatar-file-input'}
                className={`flex flex-col items-center cursor-pointer select-none ${avatarUploading ? 'pointer-events-none opacity-70' : ''}`}
              >
                <span className="relative w-20 h-20 rounded-full overflow-hidden group block active:scale-[0.97] transition-transform">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-full ${
                    avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {avatarUploading ? (
                      <span className="material-icons-round text-white animate-spin text-xl">refresh</span>
                    ) : (
                      <span className="material-icons-round text-white text-xl">camera_alt</span>
                    )}
                  </span>
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-500 mt-2">点击更换头像</span>
              </label>
            </div>

            {/* 昵称 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300" htmlFor="edit-nickname">
                昵称 <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-nickname"
                type="text"
                maxLength={20}
                value={editNickname}
                onChange={e => setEditNickname(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 dark:text-zinc-100 text-sm"
                placeholder="请输入昵称"
              />
              <p className="text-xs text-gray-400 dark:text-zinc-500 text-right">{editNickname.length}/20</p>
            </div>

            {/* 个人简介 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300" htmlFor="edit-bio">
                个人简介
              </label>
              <textarea
                id="edit-bio"
                maxLength={50}
                rows={3}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 dark:text-zinc-100 text-sm resize-none"
                placeholder="介绍一下自己吧..."
              />
              <p className="text-xs text-gray-400 dark:text-zinc-500 text-right">{editBio.length}/50</p>
            </div>

            {/* 所在城市 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300" htmlFor="edit-city">
                所在城市
              </label>
              <input
                id="edit-city"
                type="text"
                maxLength={20}
                value={editCity}
                onChange={e => setEditCity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-600 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-gray-900 dark:text-zinc-100 text-sm"
                placeholder="例如：上海"
              />
            </div>

            {/* 邮箱（只读）*/}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">邮箱</label>
              <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-zinc-400">{email || '未绑定'}</span>
                <span className="material-icons-round text-gray-300 dark:text-zinc-500 text-base">lock</span>
              </div>
            </div>

            {/* 账号 ID（只读）*/}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">账号 ID</label>
              <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-zinc-400 font-mono">{userId}</span>
                <span className="material-icons-round text-gray-300 dark:text-zinc-500 text-base">lock</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2 pb-2">
              <button
                onClick={() => setShowEditSheet(false)}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving || !editNickname.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold shadow-md shadow-primary/30 hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <span className="material-icons-round text-sm animate-spin">refresh</span>}
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 退出登录确认弹窗 */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <span className="material-icons-round text-red-500 text-2xl">logout</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">退出登录</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">确定要退出当前账号吗？</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 active:scale-[0.97] transition-all"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
