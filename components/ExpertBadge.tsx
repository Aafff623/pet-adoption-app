import React from 'react';
import { getCertificationLabel } from '../lib/api/experts';
import type { ExpertCertificationType, ExpertLevel } from '../types';

const LEVEL_STYLES: Record<ExpertLevel, string> = {
  bronze: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  silver: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
  gold: 'bg-amber-200/80 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300',
};

interface ExpertBadgeProps {
  certificationType: ExpertCertificationType;
  level?: ExpertLevel;
  size?: 'sm' | 'md';
  className?: string;
}

const ExpertBadge: React.FC<ExpertBadgeProps> = ({
  certificationType,
  level = 'bronze',
  size = 'sm',
  className = '',
}) => {
  const label = getCertificationLabel(certificationType);
  const levelStyle = LEVEL_STYLES[level];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-semibold ${levelStyle} ${sizeClass} ${className}`}
      title={label}
    >
      {size !== 'sm' && (
        <span className="material-icons-round" style={{ fontSize: 12 }}>
          verified
        </span>
      )}
      {label}
    </span>
  );
};

export default ExpertBadge;
