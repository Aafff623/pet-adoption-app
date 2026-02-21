import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { submitFeedback } from '../lib/api/feedback';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length === 0) {
      setErrorMsg('请填写问题描述');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await submitFeedback(user?.id ?? null, description.trim(), contact.trim());
      showToast('感谢您的反馈，我们会尽快处理');
      setTimeout(() => navigate('/profile'), 1500);
    } catch {
      setErrorMsg('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-zinc-700">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 ml-2">意见反馈</h1>
      </header>

      <main className="p-6 space-y-6">
        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 ml-1" htmlFor="feedback-description">
              问题描述<span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-description"
              className={`w-full h-40 bg-white dark:bg-zinc-800 rounded-2xl p-4 border text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none ${
                description.trim().length === 0 ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-zinc-700'
              }`}
              placeholder="请详细描述您遇到的问题或建议..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              aria-required="true"
            />
            {description.trim().length === 0 && (
              <p className="text-red-500 dark:text-red-300 text-xs mt-1 ml-1" aria-live="polite">问题描述不能为空</p>
            )}
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 ml-1" htmlFor="feedback-contact">
              联系方式 (选填)
            </label>
            <input
              id="feedback-contact"
              type="text"
              className="w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              placeholder="手机号/邮箱"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={description.trim().length === 0 || submitting}
            aria-disabled={description.trim().length === 0 || submitting}
          >
            {submitting && <span className="material-icons text-sm animate-spin">refresh</span>}
            {submitting ? '提交中...' : '提交反馈'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Feedback;
