import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchPetById } from '../lib/api/pets';
import { fetchHealthDiaries, createHealthDiary, deleteHealthDiary } from '../lib/api/healthDiary';
import { fetchLatestInsight, generateHealthInsight } from '../lib/api/healthInsights';
import { uploadImage } from '../lib/utils/storage';
import BottomNav from '../components/BottomNav';
import type { Pet, PetHealthDiary, PetHealthInsight } from '../types';

type TabType = 'diary' | 'insight';
type PeriodDays = 7 | 30;

const MOOD_EMOJI: Record<number, string> = { 1: '😿', 2: '😾', 3: '😐', 4: '😻', 5: '🥰' };
const LEVEL_LABEL: Record<number, string> = { 1: '很差', 2: '较差', 3: '一般', 4: '良好', 5: '很好' };

const riskConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: '健康良好', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40' },
  medium: { label: '需要关注', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40' },
  high: { label: '建议就医', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40' },
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const todayDateStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ─── Entry form state ───────────────────────────────────────────
interface FormState {
  recordedAt: string;
  moodLevel: number | null;
  appetiteLevel: number | null;
  energyLevel: number | null;
  sleepHoursInput: string;
  weightKgInput: string;
  symptoms: string;
  note: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const defaultForm = (): FormState => ({
  recordedAt: todayDateStr(),
  moodLevel: null,
  appetiteLevel: null,
  energyLevel: null,
  sleepHoursInput: '',
  weightKgInput: '',
  symptoms: '',
  note: '',
  imageFile: null,
  imagePreview: null,
});

// ─── Level picker ───────────────────────────────────────────────
const LevelPicker: React.FC<{
  label: string;
  icon: string;
  value: number | null;
  onChange: (v: number) => void;
}> = ({ label, icon, value, onChange }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
      <span className="material-icons-round text-xs">{icon}</span>{label}
    </p>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            value === n
              ? 'bg-primary text-black'
              : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
    {value != null && (
      <p className="text-[11px] text-gray-400 dark:text-zinc-500">{LEVEL_LABEL[value]}</p>
    )}
  </div>
);

// ─── Main component ─────────────────────────────────────────────
const PetHealthDiaryPage: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('diary');

  // Diary
  const [diaries, setDiaries] = useState<PetHealthDiary[]>([]);
  const [diariesLoading, setDiariesLoading] = useState(true);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Insight
  const [periodDays, setPeriodDays] = useState<PeriodDays>(7);
  const [insight, setInsight] = useState<PetHealthInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/my-pets', { replace: true });
  };

  // Load pet info
  useEffect(() => {
    if (!petId) return;
    void (async () => {
      setPetLoading(true);
      try {
        const p = await fetchPetById(petId);
        setPet(p);
      } catch {
        showToast('加载宠物信息失败');
      } finally {
        setPetLoading(false);
      }
    })();
  }, [petId, showToast]);

  // Load diaries
  useEffect(() => {
    if (!petId) return;
    void (async () => {
      setDiariesLoading(true);
      try {
        const data = await fetchHealthDiaries(petId);
        setDiaries(data);
      } catch {
        showToast('加载健康日记失败');
      } finally {
        setDiariesLoading(false);
      }
    })();
  }, [petId, showToast]);

  // Load insight when switching to insight tab or changing period
  const loadInsight = useCallback(async () => {
    if (!petId || !user) return;
    setInsightLoading(true);
    try {
      const data = await fetchLatestInsight(petId, user.id, periodDays);
      setInsight(data);
    } catch {
      // ignore, just show empty state
    } finally {
      setInsightLoading(false);
    }
  }, [petId, user, periodDays]);

  useEffect(() => {
    if (activeTab === 'insight') void loadInsight();
  }, [activeTab, loadInsight]);

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({
        ...f,
        imageFile: file,
        imagePreview: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, imageFile: null, imagePreview: null }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmitDiary = async () => {
    if (!user || !petId) return;
    const sleepHours = form.sleepHoursInput ? parseFloat(form.sleepHoursInput) : undefined;
    const weightKg = form.weightKgInput ? parseFloat(form.weightKgInput) : undefined;
    const hasAnyData =
      form.moodLevel != null ||
      form.appetiteLevel != null ||
      form.energyLevel != null ||
      form.sleepHoursInput ||
      form.weightKgInput ||
      form.symptoms.trim() ||
      form.note.trim() ||
      form.imageFile;

    if (!hasAnyData) {
      showToast('请至少填写一项健康指标或上传图片');
      return;
    }
    if (sleepHours != null && (Number.isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24)) {
      showToast('睡眠时长请输入 0-24 小时');
      return;
    }
    if (weightKg != null && (Number.isNaN(weightKg) || weightKg <= 0)) {
      showToast('请输入有效体重');
      return;
    }

    setSubmitting(true);
    try {
      // Upload image if selected
      let imageUrl: string | undefined;
      if (form.imageFile) {
        try {
          imageUrl = await uploadImage('health-diary-images', user.id, form.imageFile);
        } catch (err) {
          showToast(err instanceof Error ? err.message : '图片上传失败');
          setSubmitting(false);
          return;
        }
      }

      const created = await createHealthDiary({
        petId,
        authorId: user.id,
        moodLevel: form.moodLevel ?? undefined,
        appetiteLevel: form.appetiteLevel ?? undefined,
        energyLevel: form.energyLevel ?? undefined,
        sleepHours,
        weightKg,
        symptoms: form.symptoms.trim() || undefined,
        note: form.note.trim() || undefined,
        imageUrl,
        recordedAt: new Date(form.recordedAt).toISOString(),
      });
      setDiaries(prev => [created, ...prev]);
      setShowAddSheet(false);
      setForm(defaultForm());
      showToast('健康日记已保存');
    } catch {
      showToast('保存失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiary = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteHealthDiary(id);
      setDiaries(prev => prev.filter(d => d.id !== id));
      showToast('记录已删除');
    } catch {
      showToast('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateInsight = async () => {
    if (!petId || !user) return;
    setGenerating(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - periodDays);
      const recentEntries = diaries.filter(
        d => new Date(d.recordedAt) >= since
      );
      const result = await generateHealthInsight({
        petId,
        userId: user.id,
        periodDays,
        entries: recentEntries,
      });
      setInsight(result);
      showToast('AI 分析完成');
    } catch {
      showToast('生成分析失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="pb-24 fade-in bg-background-light dark:bg-zinc-900 min-h-screen">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center gap-3 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900 dark:text-zinc-100 leading-tight">
            {petLoading ? (
              <span className="inline-block w-24 h-4 rounded bg-gray-100 dark:bg-zinc-700 animate-pulse" />
            ) : (
              `${pet?.name ?? '宠物'} · 健康日记`
            )}
          </h1>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800 sticky top-[60px] z-30 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm">
        {([['diary', '日记', 'menu_book'], ['insight', 'AI 分析', 'psychology']] as const).map(
          ([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 dark:text-zinc-500'
              }`}
            >
              <span className="material-icons-round text-base">{icon}</span>
              {label}
            </button>
          )
        )}
      </div>

      {/* ─── 日记 Tab ─── */}
      {activeTab === 'diary' && (
        <main className="px-4 pt-4 space-y-3">
          {/* Add button */}
          <button
            onClick={() => { setForm(defaultForm()); setShowAddSheet(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-black rounded-2xl font-semibold text-sm active:scale-[0.97] transition-all shadow-sm"
          >
            <span className="material-icons-round text-base">add</span>
            新建健康记录
          </button>

          {/* List */}
          {diariesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 h-28 animate-pulse" />
              ))}
            </div>
          ) : diaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
              <span className="material-icons-round text-5xl mb-3 text-gray-200 dark:text-zinc-600">healing</span>
              <p className="text-sm">暂无健康记录</p>
              <p className="text-xs mt-1">每天记录一条，AI 为你分析趋势</p>
            </div>
          ) : (
            diaries.map(entry => (
              <DiaryCard
                key={entry.id}
                entry={entry}
                deleting={deletingId === entry.id}
                onDelete={() => void handleDeleteDiary(entry.id)}
              />
            ))
          )}
        </main>
      )}

      {/* ─── AI 分析 Tab ─── */}
      {activeTab === 'insight' && (
        <main className="px-4 pt-4 space-y-4">
          {/* Period selector */}
          <div className="flex gap-2">
            {([7, 30] as PeriodDays[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriodDays(p)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  periodDays === p
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                }`}
              >
                近 {p} 天
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={() => void handleGenerateInsight()}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-2xl text-sm font-semibold text-gray-700 dark:text-zinc-200 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {generating ? (
              <>
                <span className="material-icons-round text-base animate-spin text-primary">refresh</span>
                AI 分析中…
              </>
            ) : (
              <>
                <span className="material-icons-round text-base text-primary">auto_awesome</span>
                {insight ? '重新生成分析' : '立即生成 AI 分析'}
              </>
            )}
          </button>

          {/* Insight card */}
          {insightLoading ? (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 h-48 animate-pulse" />
          ) : insight ? (
            <InsightCard insight={insight} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-zinc-500">
              <span className="material-icons-round text-5xl mb-3 text-gray-200 dark:text-zinc-600">psychology</span>
              <p className="text-sm">暂无分析结果</p>
              <p className="text-xs mt-1">点击上方按钮，AI 为你解读宠物健康状态</p>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              to="/health-advisor"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 text-sm font-medium"
            >
              <span className="material-icons-round text-base">medical_services</span>
              AI 健康顾问
            </Link>
            <Link
              to="/health-alerts"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium"
            >
              <span className="material-icons-round text-base">notifications</span>
              健康预警
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-zinc-500 text-center pb-2">
            AI 分析仅供参考，不代替专业兽医诊断
          </p>
        </main>
      )}

      {/* ─── Add Sheet ─── */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowAddSheet(false)}
          />
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl px-5 pt-4 max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-600 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">记录健康状态</h2>

            <div className="space-y-5 overflow-y-auto flex-1 pb-4">
              {/* Date */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-icons-round text-xs">calendar_today</span>记录日期
                </p>
                <input
                  type="date"
                  value={form.recordedAt}
                  max={todayDateStr()}
                  onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100"
                />
              </div>

              {/* Mood */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-icons-round text-xs">sentiment_satisfied</span>心情
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, moodLevel: n }))}
                      className={`flex-1 text-xl py-2 rounded-xl transition-all ${
                        form.moodLevel === n
                          ? 'bg-primary/20 scale-110'
                          : 'bg-gray-50 dark:bg-zinc-800'
                      }`}
                    >
                      {MOOD_EMOJI[n]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appetite & Energy */}
              <LevelPicker
                label="食欲"
                icon="restaurant"
                value={form.appetiteLevel}
                onChange={v => setForm(f => ({ ...f, appetiteLevel: v }))}
              />
              <LevelPicker
                label="活力"
                icon="directions_run"
                value={form.energyLevel}
                onChange={v => setForm(f => ({ ...f, energyLevel: v }))}
              />

              {/* Sleep & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                    <span className="material-icons-round text-xs">bedtime</span>睡眠时长（小时）
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={form.sleepHoursInput}
                    onChange={e => setForm(f => ({ ...f, sleepHoursInput: e.target.value }))}
                    placeholder="如：12"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                    <span className="material-icons-round text-xs">monitor_weight</span>体重（kg）
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.weightKgInput}
                    onChange={e => setForm(f => ({ ...f, weightKgInput: e.target.value }))}
                    placeholder="如：4.5"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-icons-round text-xs">medical_services</span>症状描述（选填）
                </p>
                <textarea
                  value={form.symptoms}
                  onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
                  placeholder="如：轻微流鼻涕、偶尔打喷嚏"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 resize-none"
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-icons-round text-xs">edit_note</span>备注（选填）
                </p>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="今天有什么特别的事情？"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-zinc-100 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  <span className="material-icons-round text-xs">photo_camera</span>照片（选填）
                </p>
                {form.imagePreview ? (
                  <div className="relative">
                    <img
                      src={form.imagePreview}
                      alt="预览"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg active:scale-95 transition-all"
                    >
                      <span className="material-icons-round text-base">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 flex flex-col items-center gap-2 text-gray-400 dark:text-zinc-500 active:scale-[0.98] transition-all"
                    >
                      <span className="material-icons-round text-3xl">add_photo_alternate</span>
                      <span className="text-xs">点击上传照片（最大 5MB）</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Actions - Sticky Bottom */}
            <div className="flex gap-3 pt-4 pb-28 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-zinc-600 text-sm font-semibold text-gray-600 dark:text-zinc-300 active:scale-[0.97] transition-all disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitDiary()}
                disabled={submitting}
                className="flex-2 flex-1 py-3 rounded-2xl bg-primary text-black text-sm font-semibold disabled:opacity-60 active:scale-[0.97] transition-all"
              >
                {submitting ? '保存中…' : '保存记录'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

// ─── DiaryCard ───────────────────────────────────────────────────
const DiaryCard: React.FC<{
  entry: PetHealthDiary;
  deleting: boolean;
  onDelete: () => void;
}> = ({ entry, deleting, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const metrics: Array<{ icon: string; label: string; value: string }> = [];
  if (entry.moodLevel != null)
    metrics.push({ icon: '心情', label: '心情', value: MOOD_EMOJI[entry.moodLevel] });
  if (entry.appetiteLevel != null)
    metrics.push({ icon: 'restaurant', label: '食欲', value: `${entry.appetiteLevel}/5` });
  if (entry.energyLevel != null)
    metrics.push({ icon: 'directions_run', label: '活力', value: `${entry.energyLevel}/5` });
  if (entry.sleepHours != null)
    metrics.push({ icon: 'bedtime', label: '睡眠', value: `${entry.sleepHours}h` });
  if (entry.weightKg != null)
    metrics.push({ icon: 'monitor_weight', label: '体重', value: `${entry.weightKg}kg` });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
      <button
        className="w-full px-4 pt-4 pb-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-zinc-100">
            {formatDate(entry.recordedAt)}
          </span>
          <div className="flex items-center gap-2">
            {entry.imageUrl && (
              <span className="material-icons-round text-sm text-primary">photo_camera</span>
            )}
            {entry.symptoms && (
              <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                有症状
              </span>
            )}
            <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>
        {metrics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {metrics.map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-zinc-700/60 text-gray-600 dark:text-zinc-300 px-2 py-1 rounded-lg"
              >
                {m.icon.length > 1 ? (
                  <span className="material-icons-round text-[11px]">{m.icon}</span>
                ) : (
                  <span>{m.icon}</span>
                )}
                {m.label}：{m.value}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-zinc-500">无结构化指标</p>
        )}
      </button>
      {expanded && (entry.symptoms || entry.note || entry.imageUrl) && (
        <div className="px-4 pb-3 space-y-2 border-t border-gray-50 dark:border-zinc-700/50 pt-2">
          {entry.imageUrl && (
            <img
              src={entry.imageUrl}
              alt="健康日记照片"
              className="w-full h-48 object-cover rounded-xl"
            />
          )}
          {entry.symptoms && (
            <p className="text-xs text-gray-600 dark:text-zinc-300">
              <span className="font-semibold">症状：</span>{entry.symptoms}
            </p>
          )}
          {entry.note && (
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              <span className="font-semibold">备注：</span>{entry.note}
            </p>
          )}
        </div>
      )}
      {expanded && (
        <div className="px-4 pb-3 flex justify-end">
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-xs text-red-400 dark:text-red-400 flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-icons-round text-xs">delete_outline</span>
            {deleting ? '删除中…' : '删除记录'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── InsightCard ─────────────────────────────────────────────────
const InsightCard: React.FC<{ insight: PetHealthInsight }> = ({ insight }) => {
  const cfg = riskConfig[insight.riskLevel] ?? riskConfig.low;
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${cfg.bg}`}>
      {/* Risk badge + summary */}
      <div className="flex items-start gap-3">
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
          {cfg.label}
        </span>
      </div>
      <p className={`text-sm font-medium leading-relaxed ${cfg.color}`}>
        {insight.insightSummary}
      </p>

      {/* Signals */}
      {insight.signals.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-600 dark:text-zinc-300 flex items-center gap-1">
            <span className="material-icons-round text-xs">warning_amber</span>观察信号
          </p>
          <ul className="space-y-1">
            {insight.signals.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 dark:text-zinc-300 flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {insight.suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-600 dark:text-zinc-300 flex items-center gap-1">
            <span className="material-icons-round text-xs">lightbulb</span>建议
          </p>
          <ul className="space-y-1">
            {insight.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 dark:text-zinc-300 flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-gray-400 dark:text-zinc-500">
        生成于 {new Date(insight.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default PetHealthDiaryPage;
