import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchConversations,
  deleteConversation,
  getOrCreateAIConversation,
  markConversationRead,
  getOrCreateSystemConversation,
  insertSystemReply,
} from '../lib/api/messages';
import { AI_AGENTS } from '../lib/config/aiAgents';
import type { AiAgentCategory } from '../lib/config/aiAgents';
import type { Conversation } from '../types';
import { formatRelativeTime } from '../lib/utils/date';

const REPORT_INTERVAL_DAYS = 10;

const AI_AGENT_CATEGORY_META: Array<{ key: 'all' | AiAgentCategory; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'adoption', label: '领养' },
  { key: 'care', label: '照护' },
  { key: 'rescue', label: '救助' },
  { key: 'growth', label: '成长' },
];

const AI_AGENT_GROUP_ORDER: AiAgentCategory[] = ['adoption', 'care', 'rescue', 'growth'];
const AI_AGENT_GROUP_LABEL: Record<AiAgentCategory, string> = {
  adoption: '领养咨询',
  care: '健康照护',
  rescue: '救助协作',
  growth: '陪伴成长',
};

const Messages: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [activeAgentCategory, setActiveAgentCategory] = useState<'all' | AiAgentCategory>('all');
  const [showAiQuickPanel, setShowAiQuickPanel] = useState(false);
  const [reportPopup, setReportPopup] = useState<{ visible: boolean; content: string }>({ visible: false, content: '' });
  const reportPopupTimerRef = useRef<number | null>(null);
  const lastReportKeyRef = useRef('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activityAnchorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;

    const maybeShowReportPopup = (nextConversations: Conversation[]) => {
      const latestSystemReport = nextConversations.find(conv => {
        if (!conv.isSystem) return false;
        if (conv.unreadCount <= 0) return false;
        return conv.lastMessage.includes('评估报告') || conv.lastMessage.includes('AI 匹配评估');
      });

      if (!latestSystemReport) return;

      const reportKey = `${latestSystemReport.id}_${latestSystemReport.lastMessageTime}_${latestSystemReport.lastMessage}`;
      if (reportKey === lastReportKeyRef.current) return;

      lastReportKeyRef.current = reportKey;
      setReportPopup({ visible: true, content: latestSystemReport.lastMessage });

      if (reportPopupTimerRef.current) {
        window.clearTimeout(reportPopupTimerRef.current);
      }
      reportPopupTimerRef.current = window.setTimeout(() => {
        setReportPopup({ visible: false, content: '' });
      }, 4500);
    };

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchConversations(user.id);
        setConversations(data);
        maybeShowReportPopup(data);
      } catch {
        showToast('加载消息列表失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    const refresh = async () => {
      try {
        const data = await fetchConversations(user.id);
        setConversations(data);
        maybeShowReportPopup(data);
      } catch {
        // 静默刷新失败，不打断用户操作
      }
    };

    load();

    const timer = window.setInterval(() => {
      void refresh();
    }, 3000);

    return () => {
      window.clearInterval(timer);
      if (reportPopupTimerRef.current) {
        window.clearTimeout(reportPopupTimerRef.current);
      }
    };
  }, [user, showToast]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldScroll = params.get('from') === 'play-center' || params.get('anchor') === 'activity-zone';
    if (!shouldScroll) return;
    const timer = window.setTimeout(() => {
      activityAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.search]);

  useEffect(() => {
    if (!user || !profile) return;
    if ((profile.applyingCount ?? 0) <= 0 && (profile.adoptedCount ?? 0) <= 0) return;

    const key = `petconnect_score_report_${user.id}`;
    const last = localStorage.getItem(key);
    const now = Date.now();
    const intervalMs = REPORT_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

    if (last && now - Number(last) < intervalMs) {
      return;
    }

    const pushReport = async () => {
      const activityScore = Math.min(100, 40 + (profile.applyingCount ?? 0) * 12 + (profile.adoptedCount ?? 0) * 18);
      const careScore = Math.min(100, 50 + (profile.followingCount ?? 0) * 3 + (profile.adoptedCount ?? 0) * 10);
      const stabilityScore = Math.min(100, 45 + (profile.adoptedCount ?? 0) * 15);
      const summary = `📊 10天成长评分报告：活跃度 ${activityScore} 分、照护力 ${careScore} 分、稳定度 ${stabilityScore} 分。建议：继续完成回访与救助协作任务，提升综合评级。`;
      try {
        const convId = await getOrCreateSystemConversation(user.id);
        await insertSystemReply(convId, summary);
        localStorage.setItem(key, String(now));
      } catch {
        // 静默失败，避免打断消息页
      }
    };

    void pushReport();
  }, [user, profile]);

  const handleToggleSearch = () => {
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery('');
    } else {
      setShowSearch(true);
      setEditMode(false);
      setSelectedIds(new Set());
    }
  };

  const handleToggleEdit = () => {
    if (editMode) {
      setEditMode(false);
      setSelectedIds(new Set());
    } else {
      setEditMode(true);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id: string) => deleteConversation(id)));
      setConversations(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setEditMode(false);
    } catch {
      showToast('删除会话失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map((convId: string) => markConversationRead(convId)));
      setConversations((prev) => prev.map((conv) => (selectedIds.has(conv.id) ? { ...conv, unreadCount: 0 } : conv)));
      showToast(`已标记 ${selectedIds.size} 个会话为已读`);
      setSelectedIds(new Set());
      setEditMode(false);
    } catch {
      showToast('批量标记失败，请重试');
    }
  };

  const tabFiltered = conversations.filter(conv => {
    if (activeTab === 'unread') return conv.unreadCount > 0;
    if (activeTab === 'official') return conv.isSystem;
    return true;
  });

  const displayedConversations = searchQuery.trim()
    ? tabFiltered.filter(
        c =>
          c.otherUserName.includes(searchQuery.trim()) ||
          (c.lastMessage && c.lastMessage.includes(searchQuery.trim()))
      )
    : tabFiltered;

  const aiAgentList = Object.values(AI_AGENTS);
  const filteredAiAgents = activeAgentCategory === 'all'
    ? aiAgentList
    : aiAgentList.filter(item => item.category === activeAgentCategory);

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      {reportPopup.visible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000]">
          <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-lg p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-blue-500">
              <span className="material-icons-round text-lg">campaign</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">AI 评估报告已送达</p>
              <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 line-clamp-2">{reportPopup.content}</p>
            </div>
          </div>
        </div>
      )}

      <header className="px-6 pt-10 pb-4 shrink-0 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between mb-1">
          {editMode ? (
            <span className="text-base font-semibold text-gray-700 dark:text-zinc-300">
              {selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : '选择会话'}
            </span>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">消息中心</h1>
          )}
          <div className="flex items-center space-x-1">
            {!editMode && (
              <button
                onClick={handleToggleSearch}
                className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-400'}`}
                aria-label="搜索"
              >
                <span className="material-icons-round">search</span>
              </button>
            )}
            <button
              onClick={handleToggleEdit}
              className={`p-2 rounded-full transition-colors ${editMode ? 'bg-primary/10 text-primary' : 'hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-400'}`}
              aria-label={editMode ? '完成编辑' : '编辑'}
            >
              <span className="material-icons-round">{editMode ? 'check' : 'edit_note'}</span>
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        {showSearch && (
          <div className="mt-3 relative">
            <span className="material-icons-round absolute left-3 top-2.5 text-gray-400 dark:text-zinc-500 text-lg">search</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索联系人或消息..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-gray-900 dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5"
              >
                <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">cancel</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* AI 智能体入口 */}
      <div ref={activityAnchorRef} className="px-6 mb-4 shrink-0">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 dark:border-zinc-700 bg-gradient-to-br from-white to-pink-50/40 dark:from-zinc-800 dark:to-zinc-900">
          <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="px-3 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setShowAiQuickPanel((prev) => !prev)}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-icons-round text-sm">smart_toy</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">AI 智能体</p>
                {!showAiQuickPanel && (
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">{filteredAiAgents.length} 个助手可快速发起</p>
                )}
              </div>
              <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-base">{showAiQuickPanel ? 'expand_less' : 'expand_more'}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">智能助理</span>
              <button
                onClick={() => setShowNewChat(true)}
                className="text-xs font-semibold text-primary active:scale-[0.97] transition-all"
              >
                更多
              </button>
            </div>
          </div>

          {showAiQuickPanel && (
            <div className="px-3 pb-3">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {AI_AGENT_CATEGORY_META.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveAgentCategory(item.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activeAgentCategory === item.key
                        ? 'bg-primary text-black'
                        : 'bg-background-light dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filteredAiAgents.map(item => (
                  <button
                    key={item.id}
                    onClick={async () => {
                      if (!user || aiLoading) return;
                      setAiLoading(item.id);
                      try {
                        const convId = await getOrCreateAIConversation(user.id, item.id);
                        navigate(`/chat/${convId}`);
                      } catch {
                        showToast('发起 AI 会话失败，请重试');
                      } finally {
                        setAiLoading(null);
                      }
                    }}
                    disabled={!!aiLoading}
                    className="min-w-[148px] flex items-center gap-2 p-2.5 rounded-xl bg-background-light dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all text-left disabled:opacity-60 shadow-sm"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.colorClass}`}>
                      <span className="material-icons-round text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {aiLoading === item.id ? '连接中...' : item.description}
                      </p>
                    </div>
                    <span className="material-icons-round text-gray-300 dark:text-zinc-600 text-base shrink-0">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 标签页 */}
      <div className="px-6 mb-4 shrink-0">
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-1 flex shadow-sm border border-gray-100 dark:border-zinc-700" role="tablist">
          {[{ id: 'all', label: '全部' }, { id: 'unread', label: '未读' }, { id: 'official', label: '官方' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 pb-36 space-y-2" role="tabpanel">
        {loading ? (
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center p-3 gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedConversations.length > 0 ? (
          displayedConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => {
                if (editMode) {
                  handleToggleSelect(conv.id);
                } else {
                  navigate(`/chat/${conv.id}`);
                }
              }}
              className="group flex items-center p-3 -mx-3 rounded-2xl hover:bg-white dark:hover:bg-zinc-800 active:bg-gray-50 dark:active:bg-zinc-700 transition-colors cursor-pointer relative"
              role="listitem"
              aria-label={`与 ${conv.otherUserName} 的消息`}
            >
              {/* 多选框 */}
              {editMode && (
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center shrink-0 transition-colors ${
                  selectedIds.has(conv.id)
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                }`}>
                  {selectedIds.has(conv.id) && (
                    <span className="material-icons-round text-black text-sm">check</span>
                  )}
                </div>
              )}

              <div className="relative shrink-0">
                {conv.isSystem && conv.otherUserAvatar ? (
                  <img
                    src={conv.otherUserAvatar}
                    alt={conv.otherUserName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-800 bg-gray-200 dark:bg-zinc-700"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                ) : conv.isSystem ? (
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-white dark:border-zinc-800">
                    <span className="material-icons-round text-blue-500 text-2xl">notifications</span>
                  </div>
                ) : (
                  <img
                    src={conv.otherUserAvatar}
                    alt={conv.otherUserName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-800 bg-gray-200 dark:bg-zinc-700"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                )}
                {!editMode && conv.unreadCount > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold leading-none">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 truncate">{conv.otherUserName}</h3>
                  <span className={`text-xs font-medium ml-2 shrink-0 ${conv.unreadCount > 0 ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}>
                    {formatRelativeTime(conv.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate pr-2">{conv.lastMessage || '暂无消息'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
            <span className="material-icons-round text-6xl mb-4 text-gray-200 dark:text-zinc-100">
              {searchQuery ? 'search_off' : 'sentiment_dissatisfied'}
            </span>
            <p className="text-sm">{searchQuery ? `未找到"${searchQuery}"的相关消息` : '暂无相关消息'}</p>
          </div>
        )}
      </div>

      {/* 编辑模式底部操作栏 */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-gray-100 dark:border-zinc-700 px-6 py-4 z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => {
              if (selectedIds.size === displayedConversations.length) {
                setSelectedIds(new Set());
              } else {
                setSelectedIds(new Set(displayedConversations.map(c => c.id)));
              }
            }}
            className="text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
          >
            {selectedIds.size === displayedConversations.length ? '取消全选' : '全选'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkSelectedRead}
              disabled={selectedIds.size === 0 || deleting}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all active:scale-[0.97]"
            >
              标记已读
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0 || deleting}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md shadow-red-500/20 disabled:opacity-40 transition-all active:scale-[0.97]"
            >
              {deleting ? '删除中...' : `删除 (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* 新建会话浮动按钮 */}
      {!editMode && (
        <button
          onClick={() => setShowNewChat(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full fab-pulse flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform z-40"
          aria-label="发起新会话"
        >
          <span className="material-icons-round text-2xl">add_comment</span>
        </button>
      )}

      {/* 新建会话底部 Sheet */}
      {showNewChat && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowNewChat(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md flex flex-col"
            style={{ maxHeight: '70vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-gray-50 dark:border-zinc-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">发起新会话</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                aria-label="关闭"
              >
                <span className="material-icons-round text-gray-500 dark:text-zinc-400 text-lg">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4">
              {/* AI 助手 */}
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">AI 助手</p>
              <div className="space-y-4 mb-6">
                {AI_AGENT_GROUP_ORDER.map((groupKey) => {
                  const groupItems = aiAgentList.filter(item => item.category === groupKey);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={groupKey}>
                      <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{AI_AGENT_GROUP_LABEL[groupKey]}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {groupItems.map(item => (
                          <button
                            key={item.id}
                            onClick={async () => {
                              if (!user || aiLoading) return;
                              setAiLoading(item.id);
                              try {
                                const convId = await getOrCreateAIConversation(user.id, item.id);
                                setShowNewChat(false);
                                navigate(`/chat/${convId}`);
                              } catch {
                                showToast('发起 AI 会话失败，请重试');
                              } finally {
                                setAiLoading(null);
                              }
                            }}
                            disabled={!!aiLoading}
                            className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all text-left disabled:opacity-60"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.colorClass}`}>
                              <span className="material-icons-round text-2xl">{item.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{item.name}</p>
                              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                {aiLoading === item.id ? '连接中...' : item.description}
                              </p>
                            </div>
                            <span className="material-icons-round text-gray-300 dark:text-zinc-600 text-lg">chevron_right</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 最近联系人 */}
              {conversations.filter(c => !c.isSystem).length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">最近联系人</p>
                  <div className="space-y-1">
                    {conversations
                      .filter(c => !c.isSystem)
                      .slice(0, 8)
                      .map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => { setShowNewChat(false); navigate(`/chat/${conv.id}`); }}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors text-left"
                        >
                          <img
                            src={conv.otherUserAvatar}
                            alt={conv.otherUserName}
                            className="w-11 h-11 rounded-full object-cover bg-gray-200 dark:bg-zinc-700 shrink-0"
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">{conv.otherUserName}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{conv.lastMessage || '暂无消息'}</p>
                          </div>
                          <span className="material-icons-round text-gray-300 dark:text-zinc-600 text-lg">chevron_right</span>
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons-round text-5xl text-gray-200 dark:text-zinc-600 mb-3 block">chat_bubble_outline</span>
                  <p className="text-sm text-gray-400 dark:text-zinc-500 mb-2">暂无联系人</p>
                  <p className="text-xs text-gray-300 dark:text-zinc-600">浏览宠物详情页，点击聊天图标发起会话</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 回收站入口 */}
      <div className="px-6 pb-3 shrink-0">
        <button
          onClick={() => navigate('/recycle-bin')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-[0.99] transition-all text-left"
        >
          <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-xl">restore_from_trash</span>
          <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">消息回收站</span>
          <span className="material-icons-round text-gray-300 dark:text-zinc-600 text-base ml-auto">chevron_right</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;
