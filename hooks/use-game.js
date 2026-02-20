'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  gameReducer,
  createInitialState,
  getAvailableActions,
  HUMAN_SEAT,
} from '../lib/game-engine.js';

const BOT_ACTION_DELAY = 600; // ms

/**
 * useGame — 포커 게임 상태 관리 훅
 * rerender-functional-setstate 원칙 적용 (dispatch로 상태 전환)
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const botTimerRef = useRef(null);

  const clearBotTimer = () => {
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  };

  // 봇 액션 자동 처리 (actionIndex가 봇 차례일 때)
  useEffect(() => {
    const { actionIndex, players, phase, isWaitingForHuman } = state;

    if (
      actionIndex === -1 ||
      isWaitingForHuman ||
      phase === 'idle' ||
      phase === 'showdown'
    ) {
      return;
    }

    const currentPlayer = players[actionIndex];
    if (!currentPlayer || currentPlayer.isHuman || currentPlayer.isFolded) return;

    clearBotTimer();
    botTimerRef.current = setTimeout(() => {
      dispatch({ type: 'BOT_THINK' });
    }, BOT_ACTION_DELAY);

    return clearBotTimer;
  }, [state.actionIndex, state.phase, state.isWaitingForHuman]);

  // 라운드 종료 → 다음 스트릿 자동 진행
  useEffect(() => {
    const { actionIndex, phase } = state;

    if (actionIndex !== -1) return;
    if (phase === 'idle' || phase === 'showdown') return;

    clearBotTimer();
    botTimerRef.current = setTimeout(() => {
      dispatch({ type: 'NEXT_STREET' });
    }, BOT_ACTION_DELAY * 1.5);

    return clearBotTimer;
  }, [state.actionIndex, state.phase]);

  const startHand = useCallback(() => {
    clearBotTimer();
    dispatch({ type: 'START_HAND' });
  }, []);

  const playerAction = useCallback((actionType, amount) => {
    if (!state.isWaitingForHuman) return;
    dispatch({
      type: 'PLAYER_ACTION',
      payload: { seatIndex: HUMAN_SEAT, action: actionType, amount },
    });
  }, [state.isWaitingForHuman]);

  const availableActions = state.isWaitingForHuman
    ? getAvailableActions(state)
    : [];

  return {
    state,
    startHand,
    playerAction,
    availableActions,
  };
}
