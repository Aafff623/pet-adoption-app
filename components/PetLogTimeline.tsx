import React from 'react';
import type { PetLog } from '../types';

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

interface PetLogTimelineProps {
  logs: PetLog[];
  emptyText?: string;
  onEdit?: (log: PetLog) => void;
  onDelete?: (logId: string) => void;
  deletingLogId?: string | null;
}

const PetLogTimeline: React.FC<PetLogTimelineProps> = ({
  logs,
  emptyText = '暂无成长日志',
  onEdit,
  onDelete,
  deletingLogId,
}) => {
  if (logs.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-zinc-400">{emptyText}</div>;
  }

  return (
    <div className="relative pl-5 space-y-3">
      <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-zinc-600" />
      {logs.map((log) => (
        <div key={log.id} className="relative">
          <span className="absolute -left-5 top-3 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-zinc-800" />
          <div className="p-3 rounded-xl border border-gray-100 dark:border-zinc-600 bg-white dark:bg-zinc-700">
            <p className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {log.content}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400 dark:text-zinc-400">{formatDateTime(log.createdAt)}</span>
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(log)}
                      className="text-xs text-gray-500 dark:text-zinc-300"
                    >
                      编辑
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(log.id)}
                      disabled={deletingLogId === log.id}
                      className="text-xs text-red-500 disabled:opacity-50"
                    >
                      {deletingLogId === log.id ? '删除中...' : '删除'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PetLogTimeline;
