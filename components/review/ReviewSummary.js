'use client';

import { GRADE_CONFIG } from '../../lib/hand-review.js';

/**
 * ReviewSummary — 핸드 복기 전체 요약
 */
export default function ReviewSummary({ summary }) {
  const { counts, total, score } = summary;

  const scoreColor =
    score >= 80 ? 'text-green-400' :
    score >= 60 ? 'text-blue-400' :
    score >= 40 ? 'text-yellow-400' : 'text-red-400';

  const grades = ['best', 'good', 'mistake', 'blunder'];

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-4">
      {/* 점수 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">GTO 점수</div>
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-0.5">총 액션</div>
          <div className="text-xl font-semibold text-slate-200">{total}회</div>
        </div>
      </div>

      {/* 등급 바 */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-0.5">
        {grades.map((g) => {
          const pct = total > 0 ? (counts[g] ?? 0) / total : 0;
          if (pct === 0) return null;
          return (
            <div
              key={g}
              className={`${GRADE_CONFIG[g].dot} transition-all`}
              style={{ width: `${pct * 100}%` }}
              aria-label={`${GRADE_CONFIG[g].label} ${Math.round(pct * 100)}%`}
            />
          );
        })}
      </div>

      {/* 등급별 카운트 */}
      <div className="grid grid-cols-2 gap-2">
        {grades.map((g) => {
          const count = counts[g] ?? 0;
          if (count === 0 && g !== 'best') return null;
          const config = GRADE_CONFIG[g];
          return (
            <div key={g} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className="text-xs text-slate-400">{config.label}</span>
              <span className={`text-xs font-semibold ${config.color} ml-auto`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
