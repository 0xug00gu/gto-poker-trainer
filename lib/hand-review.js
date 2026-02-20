/**
 * Hand Review System — 핸드 복기 & GTO 점수화
 *
 * 등급:
 * - 'best'    🟢 GTO 최적 액션과 일치
 * - 'good'    🔵 수용 가능한 범위
 * - 'mistake' 🟡 명확한 EV 손실
 * - 'blunder' 🔴 심각한 EV 손실
 */

import { getOpenRaiseFrequency } from '../data/preflop-ranges.js';
import { cardsToHandNotation } from './deck.js';

export const GRADE_CONFIG = {
  best: { label: '최선의 수', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700/40', dot: 'bg-green-400' },
  good: { label: '좋은 수', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-700/40', dot: 'bg-blue-400' },
  mistake: { label: '실수', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40', dot: 'bg-yellow-400' },
  blunder: { label: '블런더', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700/40', dot: 'bg-red-400' },
};

/**
 * 핸드 히스토리 → 복기 데이터 생성
 * @param {Array} handHistory - game-engine.js의 handHistory
 * @returns {Array} 등급 + 코치 설명이 붙은 복기 배열
 */
export function generateHandReview(handHistory) {
  return handHistory
    .filter((entry) => entry.isHuman) // 인간 플레이어 액션만
    .map((entry) => gradeAction(entry));
}

/**
 * 단일 액션 평가 → 등급 + 설명
 */
function gradeAction(entry) {
  const { phase, action, holeCards, communityCards, pot, currentBet } = entry;

  let gtoAction = null;
  let grade = 'good';
  let explanation = '';

  if (phase === 'preflop') {
    const result = gradePreflopAction(entry);
    gtoAction = result.gtoAction;
    grade = result.grade;
    explanation = result.explanation;
  } else {
    const result = gradePostflopAction(entry);
    gtoAction = result.gtoAction;
    grade = result.grade;
    explanation = result.explanation;
  }

  return { ...entry, gtoAction, grade, explanation };
}

/**
 * 프리플랍 액션 평가
 */
function gradePreflopAction(entry) {
  const { action, holeCards, communityCards, currentBet, pot } = entry;

  // 포지션 정보는 entry에 없으므로 간략 평가
  // (실제 구현에서는 entry에 position을 추가하면 더 정확)
  const hand = cardsToHandNotation(holeCards[0], holeCards[1]);

  // 강한 핸드 여부
  const premiumHands = new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo']);
  const strongHands = new Set(['TT', '99', 'AQs', 'AQo', 'AJs', 'KQs']);
  const isPremium = premiumHands.has(hand);
  const isStrong = strongHands.has(hand);

  // 레이즈 직면 여부
  const facingRaise = currentBet > 20; // BB = 20

  if (facingRaise) {
    // 프리미엄 핸드 폴드 → 블런더
    if (isPremium && action === 'fold') {
      return {
        gtoAction: 'raise',
        grade: 'blunder',
        explanation: `${hand}은(는) 프리미엄 핸드입니다. 3벳 또는 콜이 GTO 전략입니다.`,
      };
    }
    // 약한 핸드 레이즈 → 실수
    if (!isPremium && !isStrong && action === 'raise' && currentBet > 60) {
      return {
        gtoAction: 'fold',
        grade: 'mistake',
        explanation: `${hand}으로 큰 레이즈에 재레이즈하는 것은 EV 손실이 있습니다.`,
      };
    }
    // 강한 핸드 콜/레이즈 → best
    if ((isPremium || isStrong) && (action === 'call' || action === 'raise')) {
      return {
        gtoAction: action,
        grade: 'best',
        explanation: `${hand}은(는) 이 상황에서 ${action === 'raise' ? '3벳' : '콜'}이 GTO 최적 전략입니다.`,
      };
    }
  } else {
    // 오픈 레이즈 상황
    if (action === 'fold' && (isPremium || isStrong)) {
      return {
        gtoAction: 'raise',
        grade: 'blunder',
        explanation: `${hand}을(를) 오픈 폴드하는 것은 큰 EV 손실입니다.`,
      };
    }
    if (action === 'raise' && isPremium) {
      return {
        gtoAction: 'raise',
        grade: 'best',
        explanation: `${hand}은(는) 모든 포지션에서 오픈 레이즈가 GTO 최적입니다.`,
      };
    }
  }

  return {
    gtoAction: action,
    grade: 'good',
    explanation: `이 상황에서의 ${getActionLabel(action)}은(는) 수용 가능한 범위입니다.`,
  };
}

/**
 * 포스트플랍 액션 평가
 */
function gradePostflopAction(entry) {
  const { action, holeCards, communityCards, currentBet, pot } = entry;
  const betRatio = pot > 0 ? currentBet / pot : 0;

  // 큰 베팅에 약한 핸드 콜 → 실수/블런더
  if (action === 'call' && betRatio > 0.75) {
    return {
      gtoAction: 'fold',
      grade: betRatio > 1.0 ? 'blunder' : 'mistake',
      explanation: `팟의 ${Math.round(betRatio * 100)}%에 해당하는 큰 베팅에 콜하는 것은 강한 핸드가 필요합니다.`,
    };
  }

  // 체크 가능할 때 체크 → 상황에 따라
  if (action === 'check' && currentBet === 0) {
    return {
      gtoAction: 'check',
      grade: 'good',
      explanation: '체크는 이 상황에서 밸런스를 유지하는 좋은 플레이입니다.',
    };
  }

  return {
    gtoAction: action,
    grade: 'good',
    explanation: `이 상황에서의 ${getActionLabel(action)}은(는) 수용 가능합니다.`,
  };
}

/**
 * 핸드 전체 요약 통계
 */
export function summarizeReview(reviewedActions) {
  const counts = { best: 0, good: 0, mistake: 0, blunder: 0 };
  for (const a of reviewedActions) {
    counts[a.grade] = (counts[a.grade] ?? 0) + 1;
  }
  const total = reviewedActions.length || 1;
  const score = Math.round(
    ((counts.best * 100 + counts.good * 75 + counts.mistake * 40 + counts.blunder * 0) / total)
  );
  return { counts, total, score };
}

function getActionLabel(action) {
  const map = { fold: '폴드', call: '콜', raise: '레이즈', check: '체크' };
  return map[action] ?? action;
}
