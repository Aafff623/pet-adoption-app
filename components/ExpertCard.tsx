import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExpertBadge from './ExpertBadge';
import type { ExpertWithProfile } from '../types';

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e4e4e7'/%3E%3Ctext x='50' y='58' font-size='40' text-anchor='middle'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E";

interface ExpertCardProps {
  expert: ExpertWithProfile;
  variant?: 'compact' | 'full';
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, variant = 'compact' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/experts/${expert.userId}`);
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-3 w-full p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 active:scale-[0.98] transition-all text-left"
      >
        <div className="relative shrink-0">
          <img
            src={expert.avatarUrl || DEFAULT_AVATAR}
            alt={expert.nickname}
            className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-zinc-700"
          />
          <span className="absolute -bottom-0.5 -right-0.5">
            <ExpertBadge certificationType={expert.certificationType} level={expert.level} size="sm" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 truncate">
            {expert.nickname}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            {expert.followerCount} 粉丝
            {expert.city ? ` · ${expert.city}` : ''}
          </p>
        </div>
        <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">chevron_right</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col w-full rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden hover:shadow-md active:scale-[0.98] transition-all text-left"
    >
      <div className="relative">
        <img
          src={expert.avatarUrl || DEFAULT_AVATAR}
          alt={expert.nickname}
          className="w-full aspect-[4/3] object-cover bg-gray-100 dark:bg-zinc-700"
        />
        <div className="absolute bottom-2 left-2">
          <ExpertBadge certificationType={expert.certificationType} level={expert.level} size="md" />
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 truncate">
          {expert.nickname}
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
          {expert.columnBio || expert.bio || '分享养宠心得'}
        </p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">
          {expert.followerCount} 粉丝
          {expert.city ? ` · ${expert.city}` : ''}
        </p>
      </div>
    </button>
  );
};

export default ExpertCard;
