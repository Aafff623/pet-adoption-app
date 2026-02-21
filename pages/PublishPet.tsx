import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LocationPicker, { formatLocationDisplay, type LocationOption } from '../components/LocationPicker';
import { DEFAULT_LOCATION, parseLocationDisplay } from '../lib/data/regions';
import { addPet } from '../lib/api/pets';
import { fetchVerification } from '../lib/api/verification';
import { enhancedButtonClick } from '../lib/utils/interactions';
import { uploadImage } from '../lib/utils/storage';

type PetCategory = 'dog' | 'cat' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other';
type PetGender = 'male' | 'female';
type RantTemplate = 'gentle' | 'funny';

const CATEGORIES: { id: PetCategory; label: string; icon: string }[] = [
  { id: 'dog', label: '狗狗', icon: '🐶' },
  { id: 'cat', label: '猫猫', icon: '🐱' },
  { id: 'rabbit', label: '兔子', icon: '🐰' },
  { id: 'bird', label: '鸟类', icon: '🦜' },
  { id: 'hamster', label: '仓鼠', icon: '🐹' },
  { id: 'turtle', label: '乌龟', icon: '🐢' },
  { id: 'fish', label: '鱼类', icon: '🐟' },
  { id: 'other', label: '其他', icon: '🐾' },
];

const buildRantTemplate = (template: RantTemplate, input: {
  petName: string;
  breed: string;
  ageText: string;
  fosterName: string;
}): { description: string; story: string } => {
  const petName = input.petName || '这只毛孩子';
  const breed = input.breed || '小可爱';
  const ageText = input.ageText || '未知年龄';
  const fosterName = input.fosterName || '寄养家庭';

  if (template === 'funny') {
    return {
      description: `${fosterName}吐槽：${petName}是家里“戏精担当”，社交满分、撒娇超标。`,
      story: `${fosterName}吐槽日志（搞笑版）：\n1）${petName}（${breed}，${ageText}）每天定点催饭，开粮桶声一响立刻冲到餐位。\n2）散步时遇到路人会主动营业，尾巴摇到停不下来。\n3）睡前必须来一轮“贴贴巡逻”，确认你在身边才肯安心入睡。\n\n总体评价：有点闹腾，但超级亲人，属于越相处越上头的类型。`,
    };
  }

  return {
    description: `${fosterName}记录：${petName}性格温和亲人，作息稳定，适合长期陪伴。`,
    story: `${fosterName}成长记录（温柔版）：\n${petName}是${breed}，目前${ageText}。在寄养期间表现稳定，吃饭和休息规律，能较快适应家庭节奏。\n\n它对人友善，互动时会主动靠近，情绪也比较平稳。若你正在寻找一位温柔、可陪伴的家庭成员，${petName}会是很好的选择。`,
  };
};

const PublishPet: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [ageText, setAgeText] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [category, setCategory] = useState<PetCategory>('dog');
  const [locationOption, setLocationOption] = useState<LocationOption>(DEFAULT_LOCATION);
  const [locationDetail, setLocationDetail] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [rantTemplate, setRantTemplate] = useState<RantTemplate>('gentle');
  const [isUrgent, setIsUrgent] = useState(false);
  const [price, setPrice] = useState('0');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件（JPG、PNG 等）');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('图片不能超过 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageUploading(true);
    try {
      const publicUrl = await uploadImage('pet-photos', user.id, file);
      setImageUrl(publicUrl);
      showToast('图片上传成功');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '上传失败';
      showToast(msg.includes('Bucket') || msg.includes('bucket') ? '请先为 Storage 创建 pet-photos bucket 并配置策略' : `上传失败：${msg}`);
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!profile?.city) return;
    const parsed = parseLocationDisplay(profile.city);
    if (parsed) setLocationOption(parsed);
  }, [profile?.city]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const verification = await fetchVerification(user.id).catch(() => null);
    if (!verification || verification.status !== 'approved') {
      showToast('发布宠物前需要先完成实名认证');
      navigate(`/verification?redirect=${encodeURIComponent('/publish-pet')}`);
      return;
    }

    if (!name.trim()) { showToast('请填写宠物名称'); return; }
    if (!breed.trim()) { showToast('请填写品种'); return; }
    if (!ageText.trim()) { showToast('请填写年龄'); return; }
    if (!locationOption?.city || !locationOption.city.trim()) { showToast('请填写所在城市'); return; }
    if (!description.trim()) { showToast('请填写宠物描述'); return; }

    const tags = tagsInput
      .split(/[，,\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const locationDisplay = formatLocationDisplay(locationOption);
    const trimmedLocationDetail = locationDetail.trim();
    const fullLocation = trimmedLocationDetail ? `${locationDisplay} ${trimmedLocationDetail}` : locationDisplay;

    setSubmitting(true);
    try {
      await addPet(
        {
          name: name.trim(),
          breed: breed.trim(),
          ageText: ageText.trim(),
          gender,
          category,
          location: fullLocation,
          province: locationOption.province,
          cityName: locationOption.city,
          locationDetail: locationDetail.trim() || undefined,
          weight: weight.trim() || '未知',
          description: description.trim(),
          story: story.trim(),
          isUrgent,
          price: parseInt(price, 10) || 0,
          tags,
          imageUrl: imageUrl.trim() || '',
          fosterParentName: profile?.nickname ?? '爱心寄养',
          fosterParentAvatar: profile?.avatarUrl ?? '',
        },
        user.id
      );
      showToast('发布成功，等待平台审核后上架 🎉');
      navigate('/my-pets');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '发布失败';
      showToast(msg.includes('row-level security') ? '请先完成实名认证再发布' : `发布失败：${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateRantTemplate = () => {
    const generated = buildRantTemplate(rantTemplate, {
      petName: name.trim(),
      breed: breed.trim(),
      ageText: ageText.trim(),
      fosterName: profile?.nickname ?? '寄养家庭',
    });
    if (!description.trim()) {
      setDescription(generated.description);
    }
    setStory(generated.story);
    showToast('已生成吐槽模板，可按需微调后提交');
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 ml-2">发布送养</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-24">

        {/* 提示说明 */}
        <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <span className="material-icons-round text-blue-500 text-sm mt-0.5">info</span>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            提交后平台审核通过才会上架，审核一般需要 1-3 个工作日。
          </p>
        </div>

        {/* 宠物图片 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-3 border border-gray-50 dark:border-zinc-700">
          <label className="block text-sm font-bold text-gray-800 dark:text-zinc-100">宠物图片 URL</label>
          <input
            type="url"
            placeholder="https://example.com/pet.jpg（选填）"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="预览"
              className="w-full h-40 rounded-xl object-cover bg-gray-100 dark:bg-zinc-700"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleChooseFile}
              className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 rounded-full text-sm text-gray-700 dark:text-zinc-200"
            >
              {imageUploading ? '上传中...' : '上传图片'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" aria-hidden onChange={handleFileChange} />
            <span className="text-xs text-gray-400">或粘贴图片 URL</span>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-4 border border-gray-50 dark:border-zinc-700">
          <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100">基本信息</h2>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
              宠物名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="给 TA 起个名字"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
                品种 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="如：金毛、英短..."
                value={breed}
                onChange={e => setBreed(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
                年龄 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="如：2 岁、6 个月"
                value={ageText}
                onChange={e => setAgeText(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">性别</label>
              <div className="flex gap-2">
                {([['male', '公 ♂'], ['female', '母 ♀']] as [PetGender, string][]).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setGender(v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      gender === v
                        ? 'bg-primary text-black'
                        : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">体重</label>
              <input
                type="text"
                placeholder="如：5 Kg"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
              所在城市 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 outline-none text-left flex items-center justify-between"
            >
              <span>{formatLocationDisplay(locationOption)}</span>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">expand_more</span>
            </button>
            <input
              type="text"
              placeholder="填写小区/街道（选填）"
              value={locationDetail}
              onChange={e => setLocationDetail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* 分类与标签 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-4 border border-gray-50 dark:border-zinc-700">
          <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100">分类与标签</h2>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-2">宠物种类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'bg-primary text-black'
                      : 'bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">标签（逗号分隔）</label>
            <input
              type="text"
              placeholder="如：已绝育, 亲人, 适合老人"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* 描述与故事 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-4 border border-gray-50 dark:border-zinc-700">
          <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100">描述与故事</h2>

          <div className="rounded-xl border border-primary/20 dark:border-zinc-700 bg-gradient-to-br from-pink-50/70 to-white dark:from-zinc-900 dark:to-zinc-800 px-3 py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-zinc-300">成长日志吐槽模板</p>
              <button
                type="button"
                onClick={handleGenerateRantTemplate}
                className="text-xs font-semibold text-primary"
              >
                一键生成
              </button>
            </div>
            <div className="flex gap-2">
              {([
                { key: 'gentle' as const, label: '温柔版' },
                { key: 'funny' as const, label: '搞笑版' },
              ]).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRantTemplate(item.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    rantTemplate === item.key
                      ? 'bg-primary text-black'
                      : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
              简介 <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="一句话介绍这只宠物..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">TA 的故事（选填）</label>
            <textarea
              rows={4}
              placeholder="分享 TA 的经历和个性..."
              value={story}
              onChange={e => setStory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* 其他设置 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 space-y-4 border border-gray-50 dark:border-zinc-700">
          <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100">其他设置</h2>

          <div>
            <label className="block text-xs text-gray-500 dark:text-zinc-400 mb-1.5">领养费（元）</label>
            <input
              type="number"
              min="0"
              placeholder="0 表示免费"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">紧急求领养</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">优先展示，提高曝光率</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isUrgent}
              onClick={() => setIsUrgent(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                isUrgent ? 'bg-primary' : 'bg-gray-200 dark:bg-zinc-600'
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

        {/* 提交按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-4 border-t border-gray-100 dark:border-zinc-700">
          <button
            type="submit"
            disabled={submitting}
            onClick={(e) => {
              if (!submitting) {
                enhancedButtonClick(e, { ripple: true, glow: true, primary: true });
              }
            }}
            className="w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 glow-effect ripple-container"
          >
            {submitting ? '提交中...' : '提交审核'}
          </button>
        </div>
      </form>

      <LocationPicker
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        value={locationOption}
        onChange={setLocationOption}
      />
    </div>
  );
};

export default PublishPet;
