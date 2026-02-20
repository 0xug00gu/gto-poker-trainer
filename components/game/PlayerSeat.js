'use client';

import PlayingCard from './PlayingCard.js';
import { getPosition } from '../../lib/game-engine.js';

const ACTION_LABELS = {
  fold: '폴드',
  call: '콜',
  raise: '레이즈',
  check: '체크',
  '3bet': '3벳',
  '4bet': '4벳',
};

const ACTION_COLORS = {
  fold: 'bg-gray-600 text-gray-300',
  call: 'bg-blue-700 text-blue-100',
  raise: 'bg-amber-700 text-amber-100',
  check: 'bg-slate-600 text-slate-200',
};

/**
 * PlayerSeat — 플레이어 시트 컴포넌트
 * @param {object} player - 플레이어 상태
 * @param {boolean} isCurrentAction - 현재 액션 차례
 * @param {boolean} isDealer - 딜러 버튼
 * @param {string} position - 'BTN', 'SB', 'BB' 등
 * @param {boolean} showCards - 쇼다운 시 카드 공개
 */
export default function PlayerSeat({ player, isCurrentAction, isDealer, position, showCards }) {
  if (!player) return null;

  const isFolded = player.isFolded;

  return (
    <div className={`
      relative flex flex-col items-center gap-1
      transition-all duration-200
      ${isFolded ? 'opacity-40' : 'opacity-100'}
      ${isCurrentAction ? 'scale-105' : ''}
    `}>
      {/* 딜러 버튼 */}
      {isDealer && (
        <div className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-yellow-400 text-gray-900 text-[9px] font-bold flex items-center justify-center z-10 shadow">
          D
        </div>
      )}

      {/* 카드 */}
      <div className="flex gap-0.5">
        {player.holeCards.length > 0 ? (
          player.holeCards.map((card, i) => (
            <PlayingCard
              key={i}
              card={card}
              faceDown={!player.isHuman && !showCards}
              size="sm"
            />
          ))
        ) : (
          <>
            <div className="w-8 h-11 rounded-md bg-gray-800 border border-gray-700 opacity-30" />
            <div className="w-8 h-11 rounded-md bg-gray-800 border border-gray-700 opacity-30" />
          </>
        )}
      </div>

      {/* 플레이어 정보 박스 */}
      <div className={`
        px-2 py-1 rounded-lg text-center min-w-[72px]
        ${isCurrentAction
          ? 'bg-yellow-500/20 border border-yellow-500/60 shadow-lg shadow-yellow-500/20'
          : 'bg-slate-800/80 border border-slate-600/40'
        }
        transition-all duration-200
      `}>
        <div className="text-[10px] text-slate-400 font-medium">{position}</div>
        <div className={`text-xs font-semibold truncate max-w-[68px] ${player.isHuman ? 'text-green-400' : 'text-slate-200'}`}>
          {player.name}
        </div>
        <div className="text-xs text-amber-400 font-bold">{player.chips.toLocaleString()}</div>
      </div>

      {/* 액션 표시 */}
      {player.action && !isFolded && (
        <div className={`
          px-2 py-0.5 rounded-full text-[10px] font-semibold
          ${ACTION_COLORS[player.action] ?? 'bg-slate-600 text-slate-200'}
        `}>
          {ACTION_LABELS[player.action] ?? player.action}
          {player.bet > 0 && ` ${player.bet}`}
        </div>
      )}

      {/* 베팅 칩 */}
      {player.bet > 0 && !player.action?.includes('fold') && (
        <div className="text-[9px] text-amber-300 font-bold bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-700/40">
          {player.bet}
        </div>
      )}
    </div>
  );
}
