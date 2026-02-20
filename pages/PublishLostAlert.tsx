import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createLostAlert } from '../lib/api/lostAlerts';
import type { LostPetGender, CreateLostAlertParams } from '../types';

const PET_TYPES = [
  { id: 'dog', label: '狗狗', icon: '🐶' },
  { id: 'cat', label: '猫猫', icon: '🐱' },
  { id: 'rabbit', label: '兔子', icon: '🐰' },
  { id: 'bird', label: '鸟类', icon: '🦜' },
  { id: 'other', label: '其他', icon: '🐾' },
];

const GENDER_OPTIONS: { value: LostPetGender; label: string }[] = [
  { value: 'male', label: '雄性 ♂' },
  { value: 'female', label: '雌性 ♀' },
  { value: 'unknown', label: '不确定' },
];

const RADIUS_OPTIONS = [
  { value: 3, label: '3 km' },
  { value: 10, label: '10 km' },
  { value: 30, label: '30 km' },
];

const PublishLostAlert: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // 基本信息
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petGender, setPetGender] = useState<LostPetGender>('unknown');
  const [petAgeText, setPetAgeText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // 走失信息
  const [lostAt, setLostAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [locationText, setLocationText] = useState('');
  const [rewardText, setRewardText] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);

  // 定位
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 进入页面自动尝试定位
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocating(false);
        },
        () => setLocating(false),
        { timeout: 8000 }
      );
    }
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/lost-alerts', { replace: true });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('当前设备不支持定位');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
        showToast('已获取当前位置');
      },
      () => {
        setLocating(false);
        showToast('定位失败，请检查授权设置');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!petName.trim()) { showToast('请填写宠物名字'); return; }
    if (!description.trim()) { showToast('请填写走失描述'); return; }
    if (!lostAt) { showToast('请选择走失时间'); return; }

    const params: CreateLostAlertParams = {
      petName: petName.trim(),
      petType,
      petBreed: petBreed.trim() || undefined,
      petColor: petColor.trim() || undefined,
      petGender,
      petAgeText: petAgeText.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      description: description.trim(),
      lostAt: new Date(lostAt).toISOString(),
      locationText: locationText.trim() || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      radiusKm,
      rewardText: rewardText.trim() || undefined,
      contactNote: contactNote.trim() || undefined,
      isUrgent,
    };

    setSubmitting(true);
    try {
      const alert = await createLostAlert(params, user.id);
      showToast('警报已发布，希望快快找到！');
      navigate(`/lost-alerts/${alert.id}`, { replace: true });
    } catch {
      showToast('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all">
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-text-main dark:text-zinc-100">发布失踪警报</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <main className="px-6 space-y-6">
          {/* 紧急标记 */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-50 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">🚨 紧急走失</p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">开启后将在列表中高亮显示</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isUrgent}
                onClick={() => setIsUrgent(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden ${
                  isUrgent ? 'bg-red-500' : 'bg-gray-200 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    isUrgent ? 'translate-x-[26px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 宠物基本信息 */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-text-main dark:text-zinc-100">宠物信息</h2>

            {/* 宠物种类 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 block">种类</label>
              <div className="flex gap-2 flex-wrap">
                {PET_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPetType(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
                      petType === t.id
                        ? 'bg-primary text-black'
                        : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 名字 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">
                宠物名字 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                placeholder="例：小黑、球球"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 品种 & 颜色 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">品种</label>
                <input
                  type="text"
                  value={petBreed}
                  onChange={e => setPetBreed(e.target.value)}
                  placeholder="柴犬、布偶猫…"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">毛色</label>
                <input
                  type="text"
                  value={petColor}
                  onChange={e => setPetColor(e.target.value)}
                  placeholder="橙白色、纯黑…"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 性别 & 年龄 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">性别</label>
                <div className="flex gap-1.5">
                  {GENDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPetGender(opt.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.96] ${
                        petGender === opt.value
                          ? 'bg-primary text-black'
                          : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">年龄</label>
                <input
                  type="text"
                  value={petAgeText}
                  onChange={e => setPetAgeText(e.target.value)}
                  placeholder="2岁、约3个月…"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 图片链接 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">宠物照片链接（选填）</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 走失描述 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">
                走失描述 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="描述宠物特征、走失情况、项圈颜色、标记等…"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </section>

          {/* 走失信息 */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-text-main dark:text-zinc-100">走失信息</h2>

            {/* 走失时间 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">
                走失时间 <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={lostAt}
                onChange={e => setLostAt(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 走失地点 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">走失地点描述</label>
              <input
                type="text"
                value={locationText}
                onChange={e => setLocationText(e.target.value)}
                placeholder="例：上海市徐汇区漕溪北路附近"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 定位 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">GPS 坐标</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-600 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                <span className="material-icons-round text-base">
                  {locating ? 'refresh' : latitude ? 'my_location' : 'location_searching'}
                </span>
                {locating
                  ? '定位中…'
                  : latitude
                  ? `已定位 (${latitude.toFixed(4)}, ${longitude?.toFixed(4)})`
                  : '点击获取当前位置'}
              </button>
            </div>

            {/* 搜索半径 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-2 block">广播半径</label>
              <div className="flex gap-2">
                {RADIUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRadiusKm(opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
                      radiusKm === opt.value
                        ? 'bg-primary text-black'
                        : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 悬赏 & 联系方式 */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-text-main dark:text-zinc-100">悬赏与联系（选填）</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">悬赏说明</label>
              <input
                type="text"
                value={rewardText}
                onChange={e => setRewardText(e.target.value)}
                placeholder="例：找回重谢，提供线索也有感谢红包"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">联系方式说明</label>
              <input
                type="text"
                value={contactNote}
                onChange={e => setContactNote(e.target.value)}
                placeholder="例：可直接在 App 内发送线索"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </section>

          {/* 提交 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-primary text-black font-bold text-sm shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {submitting ? '发布中…' : '🚨 发布失踪警报'}
          </button>
        </main>
      </form>
    </div>
  );
};

export default PublishLostAlert;
