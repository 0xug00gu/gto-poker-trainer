'use client';

import { useGame } from '../../hooks/use-game.js';
import PokerTable from '../../components/game/PokerTable.js';

/**
 * GameClient — 클라이언트 사이드 게임 엔트리포인트
 * server component(page.js)에서 분리하여 'use client' 경계 명확화
 */
export default function GameClient() {
  const { state, startHand, playerAction, availableActions, reviewUrl } = useGame();

  return (
    <PokerTable
      state={state}
      availableActions={availableActions}
      onAction={playerAction}
      onStartHand={startHand}
      reviewUrl={reviewUrl}
    />
  );
}
