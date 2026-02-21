import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LocationPicker, { formatLocationDisplay, type LocationOption } from '../components/LocationPicker';
import { DEFAULT_LOCATION } from '../lib/data/regions';
import { uploadImage } from '../lib/utils/storage';
import { createAdoptRequest } from '../lib/api/adoptRequests';

type PetType = 'dog' | 'cat' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other';

const PET_TYPES: { value: PetType; label: string; emoji: string }[] = [
  { value: 'dog',     label: '狗狗', emoji: '🐕' },
  { value: 'cat',     label: '猫咪', emoji: '🐈' },
  { value: 'rabbit',  label: '兔兔', emoji: '🐰' },
  { value: 'bird',    label: '鸟类', emoji: '🐦' },
  { value: 'hamster', label: '仓鼠', emoji: '🐹' },
  { value: 'turtle',  label: '龟类', emoji: '🐢' },
  { value: 'fish',    label: '鱼类', emoji: '🐟' },
  { value: 'other',   label: '其他', emoji: '🐾' },
];

const FIELD_CLASS = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700/80 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-400 border border-transparent focus:outline-none focus:border-primary/40 transition-colors text-sm';

const PublishAdoptRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [type, setType] = useState<PetType>('dog');
  const [agePref, setAgePref] = useState('');
  const [cityOption, setCityOption] = useState<LocationOption>(DEFAULT_LOCATION);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [detail, setDetail] = useState('');
  const [contact, setContact] = useState(profile?.bio ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { showToast('请选择图片文件'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('图片不能超过 5MB'); return; }
    setUploading(true);
    try {
      const url = await uploadImage('pet-photos', user.id, file);
      setImageUrl(url);
      showToast('图片上传成功');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!detail.trim() || detail.trim().length < 20) { showToast('请填写至少 20 字的收养说明'); return; }
    setSubmitting(true);
    try {
      await createAdoptRequest({
        type,
        agePref: agePref.trim() || '不限',
        city: formatLocationDisplay(cityOption),
        locationDetail: detail.trim(),
        contact: contact.trim() || undefined,
        imageUrl: imageUrl || undefined,
      }, user.id);
      showToast('求领养发布成功，等待回应 🎉');
      navigate('/profile');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen fade-in">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-3 bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all"
          aria-label="返回"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-100">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">发布求领养</h1>
      </header>

      <form id="adopt-request-form" onSubmit={handleSubmit} className="px-4 pt-5 pb-32 space-y-4">

        {/* ── 图片上传 ── */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-3">封面图片（选填）</p>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden mb-3">
                <img src={imageUrl} alt="预览" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-icons-round text-white text-base">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={uploading}
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-600 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-zinc-400 hover:border-primary/50 hover:text-primary active:scale-[0.98] transition-all mb-3"
              >
                {uploading
                  ? <span className="material-icons-round text-3xl animate-spin">autorenew</span>
                  : <span className="material-icons-round text-3xl">add_photo_alternate</span>}
                <span className="text-sm font-medium">{uploading ? '上传中…' : '点击上传图片'}</span>
                <span className="text-xs opacity-60">支持 JPG / PNG，≤ 5 MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          </div>
          {/* URL 输入 */}
          <div className="px-4 pb-4">
            <input
              type="url"
              placeholder="或直接粘贴图片链接（选填）"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </section>

        {/* ── 基本信息 ── */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-4 pt-4 pb-5 space-y-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">基本信息</p>

          {/* 宠物类型 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-2.5">想领养的动物</label>
            <div className="grid grid-cols-4 gap-2">
              {PET_TYPES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.96] ${
                    type === value
                      ? 'bg-primary text-black shadow-sm ring-2 ring-primary/30'
                      : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-600'
                  }`}
                >
                  <span className="text-xl leading-none">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 理想年龄 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-2">理想年龄</label>
            <input
              value={agePref}
              onChange={e => setAgePref(e.target.value)}
              placeholder="如：幼犬 / 1-2 岁 / 不限"
              className={FIELD_CLASS}
            />
          </div>

          {/* 所在城市 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-2">所在城市</label>
            <button
              type="button"
              onClick={() => setShowCityPicker(true)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-700/80 text-left text-sm flex items-center justify-between border border-transparent focus:outline-none transition-colors"
            >
              <span className="text-gray-900 dark:text-zinc-100">{formatLocationDisplay(cityOption)}</span>
              <span className="material-icons-round text-gray-400 dark:text-zinc-400 text-xl">expand_more</span>
            </button>
            <LocationPicker
              open={showCityPicker}
              value={cityOption}
              onChange={v => { setCityOption(v); setShowCityPicker(false); }}
              onClose={() => setShowCityPicker(false)}
            />
          </div>

          {/* 联系方式 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-200 mb-2">联系方式<span className="text-gray-400 dark:text-zinc-400 font-normal ml-1">（选填）</span></label>
            <input
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="电话 / 微信号 / 邮箱"
              className={FIELD_CLASS}
            />
          </div>
        </section>

        {/* ── 收养说明 ── */}
        <section className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm px-4 pt-4 pb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-zinc-200">收养说明</label>
            <span className={`text-xs font-medium tabular-nums ${detail.length >= 20 ? 'text-green-500' : 'text-gray-400 dark:text-zinc-400'}`}>
              {detail.length} / 20 字起
            </span>
          </div>
          <textarea
            rows={6}
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="介绍你自己、居住环境、为什么想领养、愿意提供的照顾……（至少 20 字）"
            className={`${FIELD_CLASS} resize-none leading-relaxed`}
          />
          {detail.length > 0 && detail.length < 20 && (
            <p className="mt-1.5 text-xs text-amber-500 flex items-center gap-1">
              <span className="material-icons-round text-sm">info</span>
              还需再写 {20 - detail.length} 字
            </p>
          )}
        </section>

      </form>

      {/* 底部提交栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-4 border-t border-gray-100 dark:border-zinc-700/60">
        <button
          type="submit"
          form="adopt-request-form"
          disabled={submitting || uploading}
          className="w-full py-4 bg-primary text-black font-bold rounded-2xl text-base active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-primary/20"
        >
          {submitting ? '提交中…' : '发布求领养'}
        </button>
      </div>
    </div>
  );
};

export default PublishAdoptRequest;
