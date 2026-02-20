/**
 * GTO 봇 액션 결정 로직
 *
 * 프리플랍: preflop-ranges.js 기반 확률적 결정
 * 포스트플랍: 단순 룰 기반 (C-bet, 강한 핸드, 블러핑 없음)
 */
import { cardsToHandNotation } from './deck.js';
import { RFI_RANGES, getOpenRaiseFrequency } from '../data/preflop-ranges.js';

// --- 프리플랍 ---

/**
 * RFI 상황 (아무도 레이즈 안 함) — 오픈 레이즈 여부
 */
function decidePreflopRFI(position, hand) {
  const freq = getOpenRaiseFrequency(position, hand);
  return Math.random() < freq ? 'raise' : 'fold';
}

/**
 * 레이즈에 직면 — 콜/폴드/3벳
 * 단순화: 핸드 강도 기반 확률적 결정
 */
function decidePreflopFacingRaise(position, hand, raiseSize, bigBlind) {
  const freq = getOpenRaiseFrequency(position, hand);
  const raiseRatio = raiseSize / bigBlind;

  // 3벳 레인지 (상위 10~15% 핸드)
  const threeBetThreshold = 0.85;
  // 콜 레인지
  const callThreshold = raiseRatio <= 3 ? 0.4 : 0.55;

  if (freq >= threeBetThreshold) return Math.random() < 0.7 ? '3bet' : 'call';
  if (freq >= callThreshold) return 'call';
  return 'fold';
}

/**
 * 3벳에 직면 — 4벳/콜/폴드
 */
function decidePreflopFacing3Bet(hand) {
  const premiumHands = new Set(['AA', 'KK', 'QQ', 'AKs', 'AKo']);
  const strongHands = new Set(['JJ', 'TT', 'AQs', 'AJs', 'KQs']);

  if (premiumHands.has(hand)) return Math.random() < 0.7 ? '4bet' : 'call';
  if (strongHands.has(hand)) return Math.random() < 0.3 ? '4bet' : 'call';
  return Math.random() < 0.15 ? 'call' : 'fold';
}

// --- 포스트플랍 ---

/**
 * 핸드 강도 추정 (0~10)
 * pokersolver rank 기반 간략화
 */
function estimateHandStrength(handRank, numOuts) {
  // handRank: 0=하이카드 ~ 9=로얄플러시
  return Math.min(10, handRank * 1.1 + (numOuts ?? 0) * 0.2);
}

/**
 * 포스트플랍 C-bet 결정
 * @param {object} botState
 * @param {'flop'|'turn'|'river'} street
 * @param {number} handRank - evaluateHand 결과의 rank (0~9)
 * @param {boolean} wasAggressor - 프리플랍 레이저였는지
 * @param {number} potSize
 * @param {number} currentBet
 */
export function decidePostflopAction(botState) {
  const { street, handRank, wasAggressor, potSize, currentBet, bigBlind } = botState;

  const strength = handRank; // 0~9

  // 강한 핸드: 밸류 베팅
  if (strength >= 5) {
    if (currentBet === 0) {
      // 체크 or 베팅
      return { action: 'raise', amount: Math.round(potSize * 0.6) };
    }
    return Math.random() < 0.7
      ? { action: 'raise', amount: Math.round(currentBet * 2.5) }
      : { action: 'call' };
  }

  // 중간 핸드 (페어~2페어)
  if (strength >= 2) {
    if (currentBet === 0) {
      if (wasAggressor && street === 'flop') {
        // C-bet 50% pot
        return Math.random() < 0.6
          ? { action: 'raise', amount: Math.round(potSize * 0.5) }
          : { action: 'check' };
      }
      return { action: 'check' };
    }
    const callRatio = currentBet / potSize;
    return callRatio <= 0.5 ? { action: 'call' } : { action: 'fold' };
  }

  // 약한 핸드
  if (currentBet === 0) {
    // C-bet 블러프 (wasAggressor일 때 30%)
    if (wasAggressor && street === 'flop' && Math.random() < 0.3) {
      return { action: 'raise', amount: Math.round(potSize * 0.45) };
    }
    return { action: 'check' };
  }
  return { action: 'fold' };
}

/**
 * 메인 봇 액션 결정 함수
 * @param {object} params
 * @returns {{ action: string, amount?: number }}
 */
export function decideBotAction({
  phase,
  position,
  holeCards,
  handRank,
  wasAggressor,
  potSize,
  currentBet,
  bigBlind,
  foldedBefore,
  raiseCount,
}) {
  // 폴드된 경우 스킵 (방어 코드)
  if (foldedBefore) return { action: 'fold' };

  const hand = cardsToHandNotation(holeCards[0], holeCards[1]);
  const minCallAmount = currentBet;

  if (phase === 'preflop') {
    if (raiseCount === 0) {
      const decision = decidePreflopRFI(position, hand);
      if (decision === 'raise') {
        return { action: 'raise', amount: bigBlind * 2.5 };
      }
      return { action: 'fold' };
    }

    if (raiseCount === 1) {
      const decision = decidePreflopFacingRaise(position, hand, currentBet, bigBlind);
      if (decision === '3bet') {
        return { action: 'raise', amount: currentBet * 3 };
      }
      if (decision === 'call') {
        return { action: 'call' };
      }
      return { action: 'fold' };
    }

    // 3벳+ 상황
    const decision = decidePreflopFacing3Bet(hand);
    if (decision === '4bet') {
      return { action: 'raise', amount: currentBet * 2.5 };
    }
    if (decision === 'call') {
      return { action: 'call' };
    }
    return { action: 'fold' };
  }

  // 포스트플랍
  return decidePostflopAction({
    street: phase,
    handRank: handRank ?? 0,
    wasAggressor,
    potSize,
    currentBet,
    bigBlind,
  });
}
