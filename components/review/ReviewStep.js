'use client';

import PlayingCard from '../game/PlayingCard.js';
import { GRADE_CONFIG } from '../../lib/hand-review.js';

const PHASE_LABELS = {
  preflop: '프리플랍',
  flop: '플랍',
  turn: '턴',
  river: '리버',
};

const ACTION_LABELS = {
  fold: '폴드', call: '콜', raise: '레이즈', check: '체크',
};

/**
 * ReviewStep — 복기 개별 액션 스텝
 */
export default function ReviewStep({ entry, isActive, onClick }) {
  if (!entry) return null;
  const grade = entry.grade ?? 'good';
  const config = GRADE_CONFIG[grade];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer
        ${isActive
          ? `${config.bg} ${config.border} ring-1 ring-current`
          : 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-700/50'
        }
      `}
      aria-label={`${PHASE_LABELS[entry.phase]} ${ACTION_LABELS[entry.action] ?? entry.action}`}
      aria-pressed={isActive}
    >
      <div className="flex items-start gap-3">
        {/* 등급 도트 */}
        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`} />

        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400">{PHASE_LABELS[entry.phase]}</span>
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          </div>

          {/* 액션 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">
              {ACTION_LABELS[entry.action] ?? entry.action}
              {entry.amount > 0 && ` ${entry.amount}`}
            </span>
            {entry.gtoAction && entry.gtoAction !== entry.action && (
              <span className="text-xs text-slate-500">
                → GTO: {ACTION_LABELS[entry.gtoAction] ?? entry.gtoAction}
              </span>
            )}
          </div>

          {/* 설명 (활성 상태일 때만) */}
          {isActive && entry.explanation && (
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {entry.explanation}
            </p>
          )}
        </div>

        {/* 홀 카드 */}
        <div className="flex gap-0.5 flex-shrink-0">
          {entry.holeCards?.map((card, i) => (
            <PlayingCard key={i} card={card} size="sm" />
          ))}
        </div>
      </div>
    </button>
  );
}
