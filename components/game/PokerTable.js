'use client';

import PlayerSeat from './PlayerSeat.js';
import CommunityCards from './CommunityCards.js';
import ActionPanel from './ActionPanel.js';
import PlayingCard from './PlayingCard.js';
import { getPosition, HUMAN_SEAT, NUM_PLAYERS } from '../../lib/game-engine.js';

/**
 * 6-max 테이블 시트 위치 (CSS 절대좌표, 타원형 레이아웃)
 * index 0 = 인간 플레이어 (하단 중앙)
 * 나머지는 시계 방향
 */
const SEAT_POSITIONS = [
  { bottom: '4%', left: '50%', transform: 'translateX(-50%)' },   // 0: Human (bottom)
  { bottom: '20%', left: '8%' },                                    // 1: left-bottom
  { top: '18%', left: '5%' },                                       // 2: left-top
  { top: '4%', left: '50%', transform: 'translateX(-50%)' },        // 3: top
  { top: '18%', right: '5%' },                                      // 4: right-top
  { bottom: '20%', right: '8%' },                                   // 5: right-bottom
];

export default function PokerTable({ state, availableActions, onAction, onStartHand }) {
  const { players, communityCards, pot, phase, actionIndex, dealerIndex, winners, message } = state;
  const showCards = phase === 'showdown';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 py-6"
      style={{ background: '#0D1117' }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <h1 className="text-slate-300 font-bold text-lg tracking-wide">GTO Poker Trainer</h1>
        {phase === 'idle' || phase === 'showdown' ? (
          <button
            onClick={onStartHand}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl
              transition-colors duration-150 cursor-pointer text-sm min-h-[44px]
              focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {phase === 'idle' ? '게임 시작' : '다음 핸드'}
          </button>
        ) : null}
      </div>

      {/* 포커 테이블 타원 */}
      <div className="relative w-full max-w-2xl"
        style={{ height: 'clamp(360px, 55vw, 480px)' }}>

        {/* 테이블 배경 */}
        <div className="absolute inset-6 rounded-[50%]"
          style={{
            background: 'radial-gradient(ellipse at center, #1c5232 0%, #14532d 60%, #0d3a20 100%)',
            border: '6px solid #0d3a20',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.5)',
          }} />

        {/* 커뮤니티 카드 & 팟 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CommunityCards
            communityCards={communityCards}
            pot={pot}
            phase={phase}
          />
        </div>

        {/* 6개 플레이어 시트 */}
        {players.map((player, seatIdx) => {
          const pos = SEAT_POSITIONS[seatIdx];
          const position = getPosition(seatIdx, dealerIndex);
          const isCurrentAction = actionIndex === seatIdx;
          const isDealer = seatIdx === dealerIndex;
          const isWinner = winners.includes(player.id);

          return (
            <div
              key={seatIdx}
              className="absolute"
              style={pos}
            >
              <div className={`${isWinner ? 'ring-2 ring-yellow-400 rounded-xl' : ''}`}>
                <PlayerSeat
                  player={player}
                  isCurrentAction={isCurrentAction}
                  isDealer={isDealer}
                  position={position}
                  showCards={showCards}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 인간 플레이어 카드 (크게) */}
      {players[HUMAN_SEAT]?.holeCards.length > 0 && (
        <div className="flex gap-3">
          {players[HUMAN_SEAT].holeCards.map((card, i) => (
            <PlayingCard key={i} card={card} size="lg" />
          ))}
        </div>
      )}

      {/* 메시지 */}
      {message && (
        <div className={`text-sm font-semibold px-4 py-2 rounded-lg
          ${winners.length > 0
            ? 'text-yellow-300 bg-yellow-900/30 border border-yellow-700/40'
            : 'text-slate-300 bg-slate-800/50'
          }`}>
          {message}
        </div>
      )}

      {/* 액션 패널 */}
      <div className="w-full max-w-sm">
        <ActionPanel
          availableActions={availableActions}
          onAction={onAction}
          isWaiting={state.isWaitingForHuman}
        />
      </div>
    </div>
  );
}
