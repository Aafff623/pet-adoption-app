import React from 'react';
import type { AdoptionApplication, AdoptionMilestone, AdoptionMilestoneStage } from '../types';
import { formatTime } from '../lib/utils/date';

interface Step {
  key: string;
  label: string;
  icon: string;
  activeColor: string;
}

const STEPS: Step[] = [
  { key: 'submitted', label: '提交申请', icon: 'assignment', activeColor: 'text-blue-500' },
  { key: 'reviewing', label: '审核中', icon: 'hourglass_empty', activeColor: 'text-yellow-500' },
  { key: 'result', label: '审核结果', icon: 'fact_check', activeColor: 'text-primary' },
  { key: 'adopted', label: '完成领养', icon: 'pets', activeColor: 'text-primary' },
];

function getStepIndex(status: AdoptionApplication['status']): number {
  switch (status) {
    case 'pending': return 1;
    case 'approved': return 3;
    case 'rejected': return 2;
    default: return 0;
  }
}

function getResultLabel(status: AdoptionApplication['status']): { label: string; color: string } {
  switch (status) {
    case 'approved': return { label: '审核通过 ✓', color: 'text-primary' };
    case 'rejected': return { label: '审核未通过', color: 'text-red-500' };
    default: return { label: '等待审核', color: 'text-yellow-500' };
  }
}

interface Props {
  application: AdoptionApplication;
  milestones?: AdoptionMilestone[];
  currentUserId?: string;
  onConfirmMilestone?: (milestoneId: string, confirmed: boolean, note?: string) => void;
}

const STAGE_LABEL: Record<AdoptionMilestoneStage, string> = {
  chatting: '沟通中',
  meet: '线下见面',
  trial: '试养中',
  adopted: '正式领养',
};

const STAGE_ICON: Record<AdoptionMilestoneStage, string> = {
  chatting: 'chat',
  meet: 'handshake',
  trial: 'home',
  adopted: 'pets',
};

const AdoptionProgressTimeline: React.FC<Props> = ({
  application,
  milestones,
  currentUserId,
  onConfirmMilestone,
}) => {
  if (milestones && milestones.length > 0) {
    return (
      <div className="relative pl-8">
        <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gray-100 dark:bg-zinc-700" />

        {milestones.map((milestone, idx) => {
          const isConfirmed = milestone.status === 'confirmed';
          const hasPreviousPending =
            idx > 0 && milestones.slice(0, idx).some(prev => prev.status !== 'confirmed');

          const isAdopter = currentUserId === milestone.adopterId;
          const isOwner = currentUserId === milestone.ownerId;
          const selfConfirmed = isAdopter
            ? milestone.confirmedByAdopter
            : isOwner
            ? milestone.confirmedByOwner
            : false;

          const canOperate = !hasPreviousPending && (isAdopter || isOwner);

          return (
            <div key={milestone.id} className="relative flex items-start mb-6 last:mb-0">
              <div
                className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                  isConfirmed
                    ? 'bg-white dark:bg-zinc-900 border-primary'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-600'
                }`}
              >
                <span
                  className={`material-icons-round text-sm ${
                    isConfirmed ? 'text-primary' : 'text-gray-300 dark:text-zinc-600'
                  }`}
                >
                  {STAGE_ICON[milestone.stage]}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{STAGE_LABEL[milestone.stage]}</p>

                <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full ${milestone.confirmedByAdopter ? 'bg-primary/15 text-primary' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'}`}>
                    领养人{milestone.confirmedByAdopter ? '已确认' : '待确认'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${milestone.confirmedByOwner ? 'bg-primary/15 text-primary' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400'}`}>
                    送养人{milestone.confirmedByOwner ? '已确认' : '待确认'}
                  </span>
                </div>

                {milestone.confirmedAt && (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">确认时间：{formatTime(milestone.confirmedAt)}</p>
                )}

                {milestone.note && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 whitespace-pre-wrap">{milestone.note}</p>
                )}

                {canOperate && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const note = window.prompt('补充备注（可选）') ?? '';
                        onConfirmMilestone?.(milestone.id, !selfConfirmed, note);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary active:scale-[0.97] transition-all"
                    >
                      {selfConfirmed ? '撤销我的确认' : '我已确认'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentStep = getStepIndex(application.status);
  const result = getResultLabel(application.status);

  return (
    <div className="relative pl-8">
      {/* 竖线 */}
      <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gray-100 dark:bg-zinc-700" />

      {STEPS.map((step, idx) => {
        const isActive = idx <= currentStep;
        const isCurrent = idx === currentStep;
        const isResult = step.key === 'result';
        const isAdopted = step.key === 'adopted';

        // rejected 时不显示"完成领养"步骤
        if (isAdopted && application.status === 'rejected') return null;

        const displayLabel =
          isResult && application.status !== 'pending'
            ? result.label
            : step.label;

        const labelColor =
          isResult && application.status !== 'pending'
            ? result.color
            : isActive
            ? 'text-gray-900 dark:text-zinc-100'
            : 'text-gray-400 dark:text-zinc-500';

        return (
          <div key={step.key} className="relative flex items-start mb-6 last:mb-0">
            {/* 圆点 */}
            <div
              className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 border-primary'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-600'
              }`}
            >
              <span
                className={`material-icons-round text-sm ${
                  isActive ? step.activeColor : 'text-gray-300 dark:text-zinc-600'
                }`}
              >
                {step.icon}
              </span>
            </div>

            {/* 内容 */}
            <div className={`flex-1 transition-opacity ${isActive ? '' : 'opacity-40'}`}>
              <p className={`text-sm font-bold ${labelColor}`}>{displayLabel}</p>
              {isCurrent && step.key === 'reviewing' && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">预计 1-3 个工作日完成</p>
              )}
              {idx === 0 && (
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                  {formatTime(application.createdAt)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdoptionProgressTimeline;
