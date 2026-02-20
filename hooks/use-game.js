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
  const savedHandRef = useRef(false);

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

  // 쇼다운 시 localStorage에 핸드 히스토리 저장
  useEffect(() => {
    if (state.phase !== 'showdown') {
      savedHandRef.current = false;
      return;
    }
    if (savedHandRef.current) return;
    if (!state.handId) return;

    savedHandRef.current = true;
    try {
      localStorage.setItem(`hand_${state.handId}`, JSON.stringify(state.handHistory));
      // 최근 핸드 ID 목록 유지 (최대 20개)
      const recent = JSON.parse(localStorage.getItem('recent_hands') ?? '[]');
      const updated = [state.handId, ...recent.filter((id) => id !== state.handId)].slice(0, 20);
      localStorage.setItem('recent_hands', JSON.stringify(updated));
    } catch (_) {
      // localStorage 쓰기 실패 무시
    }
  }, [state.phase, state.handId]);

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
    reviewUrl: state.phase === 'showdown' && state.handId ? `/review/${state.handId}` : null,
  };
}
