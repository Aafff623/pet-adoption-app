import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchConversations, deleteConversation } from '../lib/api/messages';
import type { Conversation } from '../types';

const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  return `${date.getMonth() + 1}-${date.getDate()}`;
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchConversations(user.id);
        setConversations(data);
      } catch {
        showToast('加载消息列表失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

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
      await Promise.all(Array.from(selectedIds).map(id => deleteConversation(id)));
      setConversations(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setEditMode(false);
    } catch {
      showToast('删除会话失败，请重试');
    } finally {
      setDeleting(false);
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

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
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
                {conv.isSystem ? (
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
                    {formatTime(conv.lastMessageTime)}
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
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0 || deleting}
            className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md shadow-red-500/20 disabled:opacity-40 transition-all active:scale-[0.97]"
          >
            {deleting ? '删除中...' : `删除 (${selectedIds.size})`}
          </button>
        </div>
      )}

      {/* 新建会话浮动按钮 */}
      {!editMode && (
        <button
          onClick={() => setShowNewChat(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform z-40"
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

      <BottomNav />
    </div>
  );
};

export default Messages;
