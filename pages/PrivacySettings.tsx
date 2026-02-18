import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PrivacyItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select';
  enabled?: boolean;
  value?: string;
  options?: { value: string; label: string }[];
}

interface PrivacyGroup {
  title: string;
  items: PrivacyItem[];
}

const STORAGE_KEY = 'petconnect_privacy_settings';

const loadSettings = (): Record<string, boolean | string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveSettings = (settings: Record<string, boolean | string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
};

const PrivacySettings: React.FC = () => {
  const navigate = useNavigate();
  const stored = loadSettings();

  const [groups, setGroups] = useState<PrivacyGroup[]>([
    {
      title: '账号可见性',
      items: [
        {
          id: 'show_profile',
          label: '公开个人主页',
          description: '允许其他用户查看您的主页',
          type: 'toggle',
          enabled: (stored['show_profile'] as boolean) ?? true,
        },
        {
          id: 'who_can_follow',
          label: '谁可以关注我',
          description: '控制谁能关注您',
          type: 'select',
          value: (stored['who_can_follow'] as string) ?? 'all',
          options: [
            { value: 'all', label: '所有人' },
            { value: 'friends', label: '仅认识的人' },
            { value: 'none', label: '不允许' },
          ],
        },
      ],
    },
    {
      title: '互动设置',
      items: [
        {
          id: 'allow_message',
          label: '允许陌生人私信',
          description: '关闭后只有互相关注的人可以发消息',
          type: 'toggle',
          enabled: (stored['allow_message'] as boolean) ?? true,
        },
        {
          id: 'show_online',
          label: '显示在线状态',
          description: '允许其他用户看到您是否在线',
          type: 'toggle',
          enabled: (stored['show_online'] as boolean) ?? false,
        },
        {
          id: 'show_activity',
          label: '显示动态记录',
          description: '允许他人看到您的收藏、点赞等动态',
          type: 'toggle',
          enabled: (stored['show_activity'] as boolean) ?? true,
        },
      ],
    },
    {
      title: '数据与隐私',
      items: [
        {
          id: 'personalized_ad',
          label: '个性化推荐',
          description: '基于您的行为推荐相关内容',
          type: 'toggle',
          enabled: (stored['personalized_ad'] as boolean) ?? true,
        },
        {
          id: 'data_analytics',
          label: '数据分析',
          description: '帮助我们改善产品体验',
          type: 'toggle',
          enabled: (stored['data_analytics'] as boolean) ?? true,
        },
      ],
    },
  ]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const updateAndSave = (updated: PrivacyGroup[]) => {
    const newSettings: Record<string, boolean | string> = {};
    updated.forEach(group => {
      group.items.forEach(item => {
        if (item.type === 'toggle') newSettings[item.id] = item.enabled!;
        if (item.type === 'select') newSettings[item.id] = item.value!;
      });
    });
    saveSettings(newSettings);
    return updated;
  };

  const toggleItem = (groupTitle: string, itemId: string) => {
    setGroups(prev => {
      const updated = prev.map(group => {
        if (group.title !== groupTitle) return group;
        return {
          ...group,
          items: group.items.map(item =>
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          ),
        };
      });
      return updateAndSave(updated);
    });
  };

  const selectValue = (groupTitle: string, itemId: string, value: string) => {
    setGroups(prev => {
      const updated = prev.map(group => {
        if (group.title !== groupTitle) return group;
        return {
          ...group,
          items: group.items.map(item =>
            item.id === itemId ? { ...item, value } : item
          ),
        };
      });
      return updateAndSave(updated);
    });
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">隐私设置</h1>
      </header>

      <main className="p-6 space-y-6">
        {groups.map(group => (
          <div key={group.title} className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500 ml-1">{group.title}</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {group.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 ${index !== group.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {item.type === 'toggle' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={item.enabled}
                        onClick={() => toggleItem(group.title, item.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden ${
                          item.enabled ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            item.enabled ? 'translate-x-[26px]' : 'translate-x-[2px]'
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{item.label}</p>
                      <p className="text-xs text-gray-400 mb-3">{item.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {item.options?.map(option => (
                          <button
                            key={option.value}
                            onClick={() => selectValue(group.title, item.id, option.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              item.value === option.value
                                ? 'bg-primary text-black'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
          <span className="material-icons-round text-blue-400 text-base mt-0.5">security</span>
          <p className="text-xs text-blue-600">您的隐私数据受到严格保护，设置将立即生效并保存。</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacySettings;
