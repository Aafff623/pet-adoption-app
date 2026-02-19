import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchAdoptedPets } from '../lib/api/pets';
import { createPetLog, deletePetLog, fetchPetLogs } from '../lib/api/petLogs';
import type { Pet, PetLog } from '../types';

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MyPets: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [logs, setLogs] = useState<PetLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [newLogContent, setNewLogContent] = useState('');
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const pets = await fetchAdoptedPets(user.id);
        setMyPets(pets);
      } catch {
        showToast('加载我的宠物失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const openLogManager = async (pet: Pet) => {
    setActivePet(pet);
    setLogsLoading(true);
    try {
      const data = await fetchPetLogs(pet.id);
      setLogs(data);
    } catch {
      showToast('加载成长日志失败');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateLog = async () => {
    if (!user || !activePet) return;
    const content = newLogContent.trim();
    if (!content) {
      showToast('请输入日志内容');
      return;
    }

    setLogSubmitting(true);
    try {
      const created = await createPetLog({
        petId: activePet.id,
        authorId: user.id,
        content,
      });
      setLogs(prev => [created, ...prev]);
      setNewLogContent('');
      showToast('成长日志发布成功');
    } catch {
      showToast('发布失败，请稍后重试');
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingLogId(logId);
    try {
      await deletePetLog(logId);
      setLogs(prev => prev.filter(item => item.id !== logId));
      showToast('日志已删除');
    } catch {
      showToast('删除失败，请重试');
    } finally {
      setDeletingLogId(null);
    }
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 ml-2">我的宠物</h1>
        <div className="flex-1"></div>
        <button className="text-primary text-sm font-bold" aria-label="添加宠物">添加</button>
      </header>

      <main className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 flex items-center gap-4 h-28 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-zinc-700 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-zinc-700 rounded w-24" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : myPets.length > 0 ? (
          myPets.map(pet => (
            <div
              key={pet.id}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/pet/${pet.id}`)}
              role="listitem"
              aria-label={`我的宠物：${pet.name}，品种：${pet.breed}`}
            >
              <img src={pet.imageUrl} alt={pet.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100">{pet.name}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{pet.breed}</p>
                <span className="inline-block mt-1 text-xs bg-green-100 dark:bg-primary/20 text-green-700 dark:text-primary px-2 py-0.5 rounded-full">已领养</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void openLogManager(pet);
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300"
                aria-label={`管理 ${pet.name} 的成长日志`}
              >
                管理日志
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
            <span className="material-icons-round text-6xl mb-4 text-gray-200 dark:text-zinc-600">sentiment_dissatisfied</span>
            <p>您还没有领养任何宠物哦</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded-full text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            >
              去领养
            </button>
          </div>
        )}
      </main>

      {activePet && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => {
            if (!logSubmitting && !deletingLogId) {
              setActivePet(null);
              setNewLogContent('');
            }
          }}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">{activePet.name} · 成长日志管理</h3>
              <button
                onClick={() => {
                  setActivePet(null);
                  setNewLogContent('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700"
                aria-label="关闭日志管理"
              >
                <span className="material-icons-round text-gray-600 dark:text-zinc-300">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600">
              <textarea
                value={newLogContent}
                onChange={e => setNewLogContent(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="写下 TA 最近的新变化..."
                className="w-full resize-none rounded-lg border border-gray-200 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 outline-none focus:border-primary"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-zinc-400">{newLogContent.length}/300</span>
                <button
                  onClick={handleCreateLog}
                  disabled={logSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold disabled:opacity-50"
                >
                  {logSubmitting ? '发布中...' : '发布'}
                </button>
              </div>
            </div>

            {logsLoading ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">日志加载中...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">暂无成长日志</p>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-zinc-600 bg-white dark:bg-zinc-700"
                  >
                    <p className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap">{log.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-zinc-400">{formatDateTime(log.createdAt)}</span>
                      <button
                        onClick={() => void handleDeleteLog(log.id)}
                        disabled={deletingLogId === log.id}
                        className="text-xs text-red-500 disabled:opacity-50"
                      >
                        {deletingLogId === log.id ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPets;
