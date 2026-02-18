import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submitAdoptionApplication } from '../lib/api/adoption';

const MAX_MESSAGE_LENGTH = 200;

const AdoptionForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const petId = searchParams.get('petId') ?? '';

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [housingType, setHousingType] = useState('自有住房');
  const [livingStatus, setLivingStatus] = useState('合租/同住');
  const [hasExperience, setHasExperience] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const validName = name.trim().length > 0;
    const validMessage = message.trim().length > 0 && message.trim().length <= MAX_MESSAGE_LENGTH;
    setIsFormValid(validName && validMessage);
  }, [name, message]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!petId) {
      setErrorMsg('未指定要申请的宠物，请返回重新选择');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await submitAdoptionApplication({
        userId: user.id,
        petId,
        fullName: name.trim(),
        age: age.trim() || '未填写',
        occupation: occupation.trim() || '未填写',
        housingType,
        livingStatus,
        hasExperience,
        message: message.trim(),
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/messages');
      }, 2000);
    } catch {
      setErrorMsg('提交失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col font-sans fade-in">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
          <div className="w-16 h-16 border-4 border-white border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-full shadow-lg z-[998] fade-in"
        >
          申请已成功提交！
        </div>
      )}

      <header className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <span className="material-icons-round text-2xl text-gray-800">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-wide">填写领养申请</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow px-5 py-6 space-y-8 pb-32 max-w-lg mx-auto w-full">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
          <div className="h-1.5 w-1/3 rounded-full bg-primary"></div>
          <div className="h-1.5 w-1/3 rounded-full bg-gray-200"></div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 个人信息 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">person</span>
              <h2 className="text-lg font-bold text-gray-900">个人信息</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="name">
                  您的姓名<span className="text-red-500">*</span>
                </label>
                <input
                  className={`block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ${name.trim().length === 0 ? 'ring-red-300' : 'ring-gray-100'}`}
                  id="name"
                  placeholder="请输入真实姓名"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  aria-required="true"
                />
                {name.trim().length === 0 && (
                  <p className="text-red-500 text-xs mt-1 ml-1" aria-live="polite">姓名不能为空</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="age">年龄</label>
                  <input
                    className="block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100"
                    id="age"
                    placeholder="25"
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5 ml-1" htmlFor="occupation">职业</label>
                  <input
                    className="block w-full px-4 py-3.5 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100"
                    id="occupation"
                    placeholder="如: 设计师"
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 居住环境 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">home</span>
              <h2 className="text-lg font-bold text-gray-900">居住环境</h2>
            </div>
            <div className="p-5 rounded-xl bg-white shadow-sm space-y-6 border border-gray-100">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500">住房情况</label>
                <div className="grid grid-cols-2 gap-3">
                  {['自有住房', '租房'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setHousingType(option)}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                        housingType === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'bg-gray-50 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="material-icons-round text-sm mr-2">{option === '自有住房' ? 'key' : 'real_estate_agent'}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-500">居住状态</label>
                <div className="grid grid-cols-2 gap-3">
                  {['独居', '合租/同住'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLivingStatus(option)}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                        livingStatus === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'bg-gray-50 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="material-icons-round text-sm mr-2">{option === '独居' ? 'person_outline' : 'groups'}</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 养宠经验 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">pets</span>
              <h2 className="text-lg font-bold text-gray-900">养宠经验</h2>
            </div>
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex">
              {[{ label: '有经验', value: true }, { label: '无经验', value: false }].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setHasExperience(opt.value)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    hasExperience === opt.value
                      ? 'bg-primary text-black shadow-lg shadow-primary/20'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  aria-pressed={hasExperience === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* 申请寄语 */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="material-icons-round text-primary text-xl">favorite</span>
              <h2 className="text-lg font-bold text-gray-900">申请寄语<span className="text-red-500">*</span></h2>
            </div>
            <div className="relative">
              <textarea
                className={`block w-full px-4 py-4 bg-white border-0 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary shadow-sm ring-1 ${
                  message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH ? 'ring-red-300' : 'ring-gray-100'
                } resize-none`}
                id="message"
                placeholder="请告诉我们您为什么要领养，以及您能为它提供什么样的生活环境..."
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                required
                aria-required="true"
              />
              {message.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1 ml-1" aria-live="polite">申请寄语不能为空</p>
              )}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20" role="alert">
              <span className="material-icons-round text-primary text-sm mt-0.5">info</span>
              <p className="text-xs text-primary/90 leading-relaxed">
                为了确保宠物能找到负责任的主人，我们会对您的信息进行严格审核。提交即代表您同意我们的隐私政策。
              </p>
            </div>
          </section>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto w-full">
          <button
            onClick={handleSubmit}
            className={`w-full bg-primary text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center space-x-2 ${
              !isFormValid || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4dd625] active:scale-[0.98]'
            }`}
            disabled={!isFormValid || isLoading}
            aria-disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-white rounded-full animate-spin mr-2"></div>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span>提交申请</span>
                <span className="material-icons-round text-base">send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdoptionForm;
