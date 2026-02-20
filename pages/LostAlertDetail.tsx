import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchLostAlertById,
  fetchSightingsByAlertId,
  submitSighting,
  closeLostAlert,
} from '../lib/api/lostAlerts';
import type { LostPetAlert, LostPetSighting } from '../types';

const PET_GENDER_LABELS: Record<string, string> = {
  male: '雄性 ♂',
  female: '雌性 ♀',
  unknown: '不确定',
};

const formatDate = (isoStr: string): string => {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const LostAlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [alert, setAlert] = useState<LostPetAlert | null>(null);
  const [sightings, setSightings] = useState<LostPetSighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [showSightingForm, setShowSightingForm] = useState(false);

  // 线索表单
  const [sightingNote, setSightingNote] = useState('');
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingTime, setSightingTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [contactHint, setContactHint] = useState('');
  const [submittingSighting, setSubmittingSighting] = useState(false);

  const isOwner = user?.id === alert?.userId;
  const isClosed = alert?.status === 'closed';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchLostAlertById(id),
      fetchSightingsByAlertId(id).catch(() => [] as LostPetSighting[]),
    ])
      .then(([alertData, sightingData]) => {
        setAlert(alertData);
        setSightings(sightingData);
      })
      .catch(() => showToast('加载详情失败'))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const handleCloseAlert = async () => {
    if (!alert || !isOwner) return;
    if (!window.confirm('确认关闭警报？关闭后将不再接受新线索。')) return;
    setClosing(true);
    try {
      await closeLostAlert(alert.id);
      setAlert(prev => prev ? { ...prev, status: 'closed', closedAt: new Date().toISOString() } : prev);
      showToast('警报已关闭，感谢您的使用');
    } catch {
      showToast('关闭失败，请重试');
    } finally {
      setClosing(false);
    }
  };

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !alert) return;
    if (!sightingNote.trim()) { showToast('请描述目击情况'); return; }

    setSubmittingSighting(true);
    try {
      const newSighting = await submitSighting(
        {
          alertId: alert.id,
          sightingNote: sightingNote.trim(),
          locationText: sightingLocation.trim() || undefined,
          sightedAt: new Date(sightingTime).toISOString(),
          contactHint: contactHint.trim() || undefined,
        },
        user.id
      );
      setSightings(prev => [newSighting, ...prev]);
      setSightingNote('');
      setSightingLocation('');
      setContactHint('');
      setShowSightingForm(false);
      showToast('线索已提交，感谢您的帮助！');
    } catch {
      showToast('提交线索失败，请重试');
    } finally {
      setSubmittingSighting(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-24 fade-in">
        <div className="px-6 pt-6 space-y-4">
          <div className="h-10 w-32 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="pb-24 fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-icons text-5xl text-gray-300 dark:text-zinc-600 mb-3">search_off</span>
        <p className="text-sm text-gray-400 dark:text-zinc-500">警报不存在或已被删除</p>
        <button
          onClick={() => navigate('/lost-alerts')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-black text-sm font-medium active:scale-[0.97] transition-all"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/lost-alerts', { replace: true }); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-text-main dark:text-zinc-100 flex-1">走失详情</h1>
          {isClosed && (
            <span className="text-xs bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 px-3 py-1 rounded-full font-medium">
              已关闭
            </span>
          )}
        </div>
      </header>

      <main className="px-6 space-y-5">
        {/* 宠物卡片 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-50 dark:border-zinc-700">
          {alert.avatarUrl && (
            <img
              src={alert.avatarUrl}
              alt={alert.petName}
              className="w-full h-52 object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {alert.isUrgent && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      紧急
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-text-main dark:text-zinc-100">{alert.petName}</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  {alert.petType === 'dog' ? '狗狗' : alert.petType === 'cat' ? '猫猫' : alert.petType}
                  {alert.petBreed ? ` · ${alert.petBreed}` : ''}
                  {alert.petGender ? ` · ${PET_GENDER_LABELS[alert.petGender]}` : ''}
                  {alert.petAgeText ? ` · ${alert.petAgeText}` : ''}
                </p>
                {alert.petColor && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">毛色：{alert.petColor}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-zinc-300 mt-4 leading-relaxed">{alert.description}</p>
          </div>
        </div>

        {/* 走失时间地点 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm border border-gray-50 dark:border-zinc-700 space-y-3">
          <h3 className="text-sm font-bold text-text-main dark:text-zinc-100">走失信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base mt-0.5">schedule</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-zinc-300">走失时间：</span>
                <span className="text-gray-600 dark:text-zinc-400">{formatDate(alert.lostAt)}</span>
              </div>
            </div>
            {alert.locationText && (
              <div className="flex items-start gap-2">
                <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base mt-0.5">location_on</span>
                <div>
                  <span className="font-medium text-gray-700 dark:text-zinc-300">走失地点：</span>
                  <span className="text-gray-600 dark:text-zinc-400">{alert.locationText}</span>
                </div>
              </div>
            )}
            {alert.rewardText && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <span className="text-amber-500">🎁</span>
                <p className="text-amber-800 dark:text-amber-300 text-sm">{alert.rewardText}</p>
              </div>
            )}
            {alert.contactNote && (
              <div className="flex items-start gap-2">
                <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base mt-0.5">contact_phone</span>
                <div>
                  <span className="font-medium text-gray-700 dark:text-zinc-300">联系方式：</span>
                  <span className="text-gray-600 dark:text-zinc-400">{alert.contactNote}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作区 */}
        {!isClosed && (
          <div className="space-y-3">
            {!isOwner && user && (
              <button
                onClick={() => setShowSightingForm(true)}
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-bold text-sm shadow-md shadow-primary/30 active:scale-[0.97] transition-all"
              >
                📍 我看到了！提交线索
              </button>
            )}
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-bold text-sm shadow-md shadow-primary/30 active:scale-[0.97] transition-all"
              >
                登录后提交线索
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleCloseAlert}
                disabled={closing}
                className="w-full py-3.5 rounded-2xl border-2 border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-zinc-400 font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {closing ? '关闭中…' : '✅ 已找到，关闭警报'}
              </button>
            )}
          </div>
        )}

        {/* 线索列表（仅警报发布者和线索提交者可见，此处展示） */}
        {(isOwner || sightings.length > 0) && (
          <section>
            <h3 className="text-base font-bold text-text-main dark:text-zinc-100 mb-3">
              目击线索 {sightings.length > 0 && <span className="text-primary">({sightings.length})</span>}
            </h3>
            {sightings.length === 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 text-center border border-gray-50 dark:border-zinc-700">
                <p className="text-sm text-gray-400 dark:text-zinc-500">暂无线索，期待好消息 🙏</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sightings.map(s => (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-50 dark:border-zinc-700"
                  >
                    <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{s.sightingNote}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400 dark:text-zinc-500">
                      {s.locationText && (
                        <span className="flex items-center gap-0.5">
                          <span className="material-icons-round text-[12px]">location_on</span>
                          {s.locationText}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons-round text-[12px]">schedule</span>
                        {formatDate(s.sightedAt)}
                      </span>
                      {s.contactHint && (
                        <span className="flex items-center gap-0.5">
                          <span className="material-icons-round text-[12px]">phone</span>
                          {s.contactHint}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* 提交线索底部弹窗 */}
      {showSightingForm && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowSightingForm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">提交目击线索</h3>
              <button
                onClick={() => setShowSightingForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-[0.9] transition-all"
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400 text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">
                  目击描述 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={sightingNote}
                  onChange={e => setSightingNote(e.target.value)}
                  rows={3}
                  placeholder="描述您看到的情况，宠物状态、行进方向等…"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">目击地点</label>
                  <input
                    type="text"
                    value={sightingLocation}
                    onChange={e => setSightingLocation(e.target.value)}
                    placeholder="街道/小区名"
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">目击时间</label>
                  <input
                    type="datetime-local"
                    value={sightingTime}
                    onChange={e => setSightingTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 block">联系提示（选填）</label>
                <input
                  type="text"
                  value={contactHint}
                  onChange={e => setContactHint(e.target.value)}
                  placeholder="方便联系您的方式"
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-zinc-700 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={submittingSighting}
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-bold text-sm shadow-md shadow-primary/30 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {submittingSighting ? '提交中…' : '提交线索'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostAlertDetail;
