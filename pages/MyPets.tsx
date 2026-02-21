import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchAdoptedPets } from '../lib/api/pets';
import { createPetLog, deletePetLog, fetchPetLogs, updatePetLog } from '../lib/api/petLogs';
import { createFollowUpTask, fetchFollowUpTasks, completeFollowUpTask, ensureDefaultFollowUpTemplates } from '../lib/api/followUps';
import PetLogTimeline from '../components/PetLogTimeline';
import type { Pet, PetLog, FollowUpTask } from '../types';

type FollowUpFilter = 'all' | 'pending' | 'overdue' | 'completed';

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

const getDateStart = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateAfterDays = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [updatingLog, setUpdatingLog] = useState(false);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [followUpPet, setFollowUpPet] = useState<Pet | null>(null);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDueDate, setFollowUpDueDate] = useState(getDateAfterDays(7));
  const [followUpTemplateKey, setFollowUpTemplateKey] = useState<string | undefined>(undefined);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [completingTask, setCompletingTask] = useState<FollowUpTask | null>(null);
  const [followUpFeedback, setFollowUpFeedback] = useState('');
  const [followUpCompleting, setFollowUpCompleting] = useState(false);
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('all');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setFollowUpsLoading(true);
      try {
        const [pets, tasks] = await Promise.all([
          fetchAdoptedPets(user.id),
          fetchFollowUpTasks(user.id),
        ]);

        setMyPets(pets);

        let latestTasks = tasks;
        if (pets.length > 0) {
          try {
            await Promise.all(
              pets.map(pet => ensureDefaultFollowUpTemplates({
                userId: user.id,
                petId: pet.id,
                petName: pet.name,
                day7DueDate: getDateAfterDays(7),
                day30DueDate: getDateAfterDays(30),
              }))
            );
            latestTasks = await fetchFollowUpTasks(user.id);
          } catch (err) {
            console.error('回访任务初始化失败:', err);
          }
        }

        setFollowUpTasks(latestTasks);
      } catch {
        showToast('加载我的宠物失败，请重试');
      } finally {
        setLoading(false);
        setFollowUpsLoading(false);
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

  const startEditLog = (log: PetLog) => {
    setEditingLogId(log.id);
    setEditingContent(log.content);
  };

  const handleUpdateLog = async () => {
    if (!editingLogId) return;
    const content = editingContent.trim();
    if (!content) {
      showToast('日志内容不能为空');
      return;
    }

    setUpdatingLog(true);
    try {
      const updated = await updatePetLog({
        logId: editingLogId,
        content,
      });
      setLogs(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      setEditingLogId(null);
      setEditingContent('');
      showToast('日志已更新');
    } catch {
      showToast('更新失败，请稍后重试');
    } finally {
      setUpdatingLog(false);
    }
  };

  const openFollowUpCreator = (pet: Pet) => {
    setFollowUpPet(pet);
    setFollowUpTitle(`回访 ${pet.name} 近况`);
    setFollowUpDueDate(getDateAfterDays(7));
    setFollowUpTemplateKey(undefined);
  };

  const applyFollowUpTemplate = (days: number) => {
    if (!followUpPet) return;
    setFollowUpTitle(`${days}天回访 · ${followUpPet.name}`);
    setFollowUpDueDate(getDateAfterDays(days));
    setFollowUpTemplateKey(days === 7 ? 'day7' : 'day30');
  };

  const handleCreateFollowUpTask = async () => {
    if (!user || !followUpPet) return;
    const title = followUpTitle.trim();
    if (!title) {
      showToast('请输入回访任务标题');
      return;
    }
    if (!followUpDueDate) {
      showToast('请选择回访日期');
      return;
    }

    setFollowUpSubmitting(true);
    try {
      const created = await createFollowUpTask({
        userId: user.id,
        petId: followUpPet.id,
        title,
        dueDate: followUpDueDate,
        templateKey: followUpTemplateKey,
      });
      setFollowUpTasks(prev => [created, ...prev]);
      setFollowUpPet(null);
      setFollowUpTemplateKey(undefined);
      showToast('回访任务已创建');
    } catch {
      showToast('创建回访任务失败，请稍后重试');
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  const startCompleteTask = (task: FollowUpTask) => {
    setCompletingTask(task);
    setFollowUpFeedback(task.feedback ?? '');
  };

  const handleCompleteFollowUpTask = async () => {
    if (!completingTask) return;
    const feedback = followUpFeedback.trim();
    if (!feedback) {
      showToast('请填写回访反馈');
      return;
    }

    setFollowUpCompleting(true);
    try {
      const updated = await completeFollowUpTask({
        taskId: completingTask.id,
        feedback,
      });
      setFollowUpTasks(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      setCompletingTask(null);
      setFollowUpFeedback('');
      showToast('回访任务已完成');
    } catch {
      showToast('提交回访反馈失败');
    } finally {
      setFollowUpCompleting(false);
    }
  };

  const handleCreateDefaultTemplates = async () => {
    if (!user || !followUpPet) return;

    setFollowUpSubmitting(true);
    try {
      const [task7, task30] = await Promise.all([
        createFollowUpTask({
          userId: user.id,
          petId: followUpPet.id,
          title: `7天回访 · ${followUpPet.name}`,
          dueDate: getDateAfterDays(7),
          templateKey: 'day7',
        }),
        createFollowUpTask({
          userId: user.id,
          petId: followUpPet.id,
          title: `30天回访 · ${followUpPet.name}`,
          dueDate: getDateAfterDays(30),
          templateKey: 'day30',
        }),
      ]);

      setFollowUpTasks(prev => [task7, task30, ...prev]);
      setFollowUpPet(null);
      showToast('已创建 7天/30天 回访模板任务');
    } catch {
      showToast('创建模板任务失败，请稍后重试');
    } finally {
      setFollowUpSubmitting(false);
    }
  };

  const petNameMap = myPets.reduce<Record<string, string>>((map, pet) => {
    map[pet.id] = pet.name;
    return map;
  }, {});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingFollowUps = followUpTasks.filter(task => task.status === 'pending');
  const overdueFollowUps = pendingFollowUps.filter(task => {
    const due = getDateStart(task.dueDate);
    return due ? due < today : false;
  });
  const todayFollowUps = pendingFollowUps.filter(task => {
    const due = getDateStart(task.dueDate);
    return due ? due.getTime() === today.getTime() : false;
  });
  const upcomingFollowUps = pendingFollowUps.filter(task => {
    const due = getDateStart(task.dueDate);
    return due ? due > today : false;
  });

  const reminderTasks = [...overdueFollowUps, ...todayFollowUps].slice(0, 5);

  const sortedFollowUpTasks = [...followUpTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;

    if (a.status === 'pending' && b.status === 'pending') {
      const aDue = getDateStart(a.dueDate)?.getTime() ?? 0;
      const bDue = getDateStart(b.dueDate)?.getTime() ?? 0;
      return aDue - bDue;
    }

    const aCompleted = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bCompleted = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bCompleted - aCompleted;
  });

  const filteredFollowUpTasks = sortedFollowUpTasks.filter(task => {
    if (followUpFilter === 'all') return true;
    if (followUpFilter === 'pending') return task.status === 'pending';
    if (followUpFilter === 'completed') return task.status === 'completed';

    const due = getDateStart(task.dueDate);
    return task.status === 'pending' && Boolean(due && due < today);
  });

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
              className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 flex items-start gap-4 cursor-pointer active:scale-[0.98] transition-transform"
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
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void openLogManager(pet);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 text-center"
                  aria-label={`管理 ${pet.name} 的成长日志`}
                >
                  成长日志
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/pet-health/${pet.id}`);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-center"
                  aria-label={`查看 ${pet.name} 的健康日记`}
                >
                  健康日记
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFollowUpCreator(pet);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-center"
                  aria-label={`为 ${pet.name} 创建回访任务`}
                >
                  创建回访
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/insurance?tab=my');
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-center"
                  aria-label={`查看 ${pet.name} 的保单`}
                >
                  查看保单
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/insurance?tab=my');
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 text-center col-span-2"
                  aria-label={`为 ${pet.name} 申请理赔`}
                >
                  申请理赔
                </button>
              </div>
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

        {myPets.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">领养回访任务</h2>
              <span className="text-xs text-gray-400 dark:text-zinc-400">
                待完成 {pendingFollowUps.length}
              </span>
            </div>

            {!followUpsLoading && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-2.5">
                  <p className="text-[11px] text-red-600 dark:text-red-300">已逾期</p>
                  <p className="text-base font-bold text-red-700 dark:text-red-200">{overdueFollowUps.length}</p>
                </div>
                <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-2.5">
                  <p className="text-[11px] text-amber-600 dark:text-amber-300">今日待办</p>
                  <p className="text-base font-bold text-amber-700 dark:text-amber-200">{todayFollowUps.length}</p>
                </div>
                <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-2.5">
                  <p className="text-[11px] text-blue-600 dark:text-blue-300">后续计划</p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-200">{upcomingFollowUps.length}</p>
                </div>
              </div>
            )}

            {!followUpsLoading && followUpTasks.length > 0 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'pending', label: '待办' },
                  { key: 'overdue', label: '逾期' },
                  { key: 'completed', label: '已完成' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFollowUpFilter(item.key as FollowUpFilter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      followUpFilter === item.key
                        ? 'bg-primary text-black'
                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {followUpsLoading ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">回访任务加载中...</p>
            ) : followUpTasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">暂无回访任务，可在宠物卡片中创建</p>
            ) : (
              <div className="space-y-3">
                {reminderTasks.length > 0 && (
                  <div className="rounded-xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-900/20 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-icons-round text-orange-500 text-base">notifications_active</span>
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">优先处理提醒</p>
                    </div>
                    <div className="space-y-2">
                      {reminderTasks.map(task => {
                        const isOverdue = overdueFollowUps.some(item => item.id === task.id);
                        return (
                          <div key={`reminder-${task.id}`} className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-800 rounded-lg px-2.5 py-2 border border-orange-100 dark:border-zinc-700">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">{task.title}</p>
                              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                                {petNameMap[task.petId] ?? '宠物'} · {isOverdue ? '已逾期' : '今日截止'} ({formatDate(task.dueDate)})
                              </p>
                            </div>
                            <button
                              onClick={() => startCompleteTask(task)}
                              className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-md bg-primary text-black font-semibold"
                            >
                              去填写
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredFollowUpTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                          {petNameMap[task.petId] ?? '宠物'} · 截止 {formatDate(task.dueDate)}
                        </p>
                      </div>
                      {task.status === 'completed' ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-primary/20 text-green-700 dark:text-primary">已完成</span>
                      ) : (
                        <button
                          onClick={() => startCompleteTask(task)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-black font-semibold"
                        >
                          填写回访
                        </button>
                      )}
                    </div>
                    {task.status === 'completed' && task.feedback && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-700 rounded-lg px-2 py-1.5">
                        回访反馈：{task.feedback}
                      </p>
                    )}
                  </div>
                ))}

                {filteredFollowUpTasks.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">当前筛选下暂无任务</p>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {followUpPet && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[1000] flex items-end justify-center"
          onClick={() => {
            if (!followUpSubmitting) {
              setFollowUpPet(null);
              setFollowUpTemplateKey(undefined);
            }
          }}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">为 {followUpPet.name} 创建回访任务</h3>
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-3">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">快捷模板</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyFollowUpTemplate(7)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-zinc-700"
                >
                  7天模板
                </button>
                <button
                  onClick={() => applyFollowUpTemplate(30)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-zinc-700"
                >
                  30天模板
                </button>
                <button
                  onClick={handleCreateDefaultTemplates}
                  disabled={followUpSubmitting}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-black disabled:opacity-50"
                >
                  一键建两条
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <input
                value={followUpTitle}
                onChange={e => {
                  setFollowUpTitle(e.target.value);
                  setFollowUpTemplateKey(undefined);
                }}
                maxLength={60}
                placeholder="输入任务标题"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm outline-none focus:border-primary"
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">截止日期</p>
                <input
                  type="date"
                  value={followUpDueDate}
                  onChange={e => setFollowUpDueDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFollowUpPet(null);
                  setFollowUpTemplateKey(undefined);
                }}
                disabled={followUpSubmitting}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleCreateFollowUpTask}
                disabled={followUpSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary text-black text-sm font-semibold disabled:opacity-50"
              >
                {followUpSubmitting ? '创建中...' : '创建任务'}
              </button>
            </div>
          </div>
        </div>
      )}

      {completingTask && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[1001] flex items-end justify-center"
          onClick={() => !followUpCompleting && setCompletingTask(null)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">填写回访反馈</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{completingTask.title}</p>
            <textarea
              value={followUpFeedback}
              onChange={e => setFollowUpFeedback(e.target.value)}
              rows={4}
              maxLength={300}
              placeholder="例如：食欲正常、体重稳定、精神状态良好..."
              className="w-full resize-none rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="text-xs text-gray-400 dark:text-zinc-400">{followUpFeedback.length}/300</div>
            <div className="flex gap-3">
              <button
                onClick={() => setCompletingTask(null)}
                disabled={followUpCompleting}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-zinc-600 text-sm font-semibold"
              >
                稍后填写
              </button>
              <button
                onClick={handleCompleteFollowUpTask}
                disabled={followUpCompleting}
                className="flex-1 h-11 rounded-xl bg-primary text-black text-sm font-semibold disabled:opacity-50"
              >
                {followUpCompleting ? '提交中...' : '提交反馈'}
              </button>
            </div>
          </div>
        </div>
      )}

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

            {editingLogId && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">编辑日志</p>
                <textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-lg border border-gray-200 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-800 dark:text-zinc-100 outline-none focus:border-primary"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-zinc-400">{editingContent.length}/300</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLogId(null);
                        setEditingContent('');
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-zinc-200"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateLog}
                      disabled={updatingLog}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-black disabled:opacity-50"
                    >
                      {updatingLog ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {logsLoading ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400">日志加载中...</p>
            ) : (
              <PetLogTimeline
                logs={logs}
                onEdit={startEditLog}
                onDelete={(logId) => void handleDeleteLog(logId)}
                deletingLogId={deletingLogId}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPets;
