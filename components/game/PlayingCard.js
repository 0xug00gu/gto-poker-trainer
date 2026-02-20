'use client';

import { cardDisplayName, SUIT_COLORS } from '../../lib/deck.js';

/**
 * PlayingCard — 포커 카드 컴포넌트
 * @param {string} card - 'As', 'Kh' 등. null이면 뒷면 표시
 * @param {boolean} faceDown - true면 뒷면 표시
 * @param {'sm'|'md'|'lg'} size
 */
export default function PlayingCard({ card, faceDown = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-11 text-xs',
    md: 'w-12 h-16 text-sm',
    lg: 'w-16 h-22 text-base',
  };

  if (!card || faceDown) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-md flex items-center justify-center select-none`}
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2042 100%)', border: '1px solid #2d5a8e', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        aria-label="카드 뒷면"
      >
        <div className="text-blue-300 opacity-40 text-lg font-bold">♦</div>
      </div>
    );
  }

  const { rank, suit } = cardDisplayName(card);
  const isRed = card[1] === 'h' || card[1] === 'd';

  return (
    <div
      className={`${sizeClasses[size]} rounded-md flex flex-col justify-between p-1 select-none`}
      style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
      aria-label={`${rank}${suit}`}
    >
      <div className={`font-bold leading-none ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        <div className="text-[10px] leading-tight">{rank}</div>
        <div className="text-[10px] leading-tight">{suit}</div>
      </div>
      <div className={`text-center font-bold ${isRed ? 'text-red-600' : 'text-gray-900'} ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {suit}
      </div>
    </div>
  );
}
