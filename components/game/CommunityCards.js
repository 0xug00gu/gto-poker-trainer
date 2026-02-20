'use client';

import PlayingCard from './PlayingCard.js';

/**
 * CommunityCards — 커뮤니티 카드 + 팟 표시
 */
export default function CommunityCards({ communityCards, pot, phase }) {
  const PHASE_LABELS = {
    preflop: '프리플랍',
    flop: '플랍',
    turn: '턴',
    river: '리버',
    showdown: '쇼다운',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 팟 */}
      <div className="flex items-center gap-2">
        <div className="text-amber-400 font-bold text-sm">
          팟: {pot.toLocaleString()}
        </div>
        {phase && phase !== 'idle' && (
          <div className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-600/30">
            {PHASE_LABELS[phase] ?? phase}
          </div>
        )}
      </div>

      {/* 커뮤니티 카드 5장 */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <PlayingCard
            key={i}
            card={communityCards[i] ?? null}
            faceDown={!communityCards[i]}
            size="md"
          />
        ))}
      </div>
    </div>
  );
}
