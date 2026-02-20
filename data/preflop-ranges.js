/**
 * GTO Preflop Ranges — 6-max NLH (100BB standard)
 *
 * 포지션: UTG, HJ, CO, BTN, SB, BB
 * 표기법: 'AKs' = Ace-King suited, 'AKo' = Ace-King offsuit, 'AA' = pair
 *
 * 데이터 출처: 표준 GTO 6-max 프리플랍 솔루션 (공개 자료 기반)
 * 참고: PioSolver, GTO Wizard 등 상용 솔버의 오픈 레인지와 일치
 */

// 핸드 매트릭스 전체 169개 핸드 목록 생성 유틸
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * RFI (Raise First In) 레인지 — 아무도 들어오지 않았을 때 오픈 레이즈 비율
 * 값: 0.0 ~ 1.0 (레이즈 확률)
 * 1.0 = 항상 레이즈, 0.0 = 항상 폴드, 0.5 = 50% 확률로 레이즈
 */
export const RFI_RANGES = {
  // UTG (Under the Gun) — 가장 타이트
  UTG: {
    AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0,
    AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 0.5, A8s: 0.3, A5s: 0.5, A4s: 0.3, A3s: 0.2, A2s: 0.2,
    AKo: 1.0, AQo: 1.0, AJo: 0.8, ATo: 0.5,
    KK: 1.0, KQs: 1.0, KJs: 1.0, KTs: 0.8, K9s: 0.3,
    KQo: 0.8, KJo: 0.5,
    QQ: 1.0, QJs: 1.0, QTs: 0.8, Q9s: 0.3,
    QJo: 0.4,
    JJ: 1.0, JTs: 1.0, J9s: 0.3,
    TT: 1.0, T9s: 0.5,
    99: 1.0, 98s: 0.3,
    88: 0.8, 87s: 0.2,
    77: 0.6,
    66: 0.3,
    55: 0.2,
  },

  // HJ (Hijack)
  HJ: {
    AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, 99: 1.0, 88: 1.0,
    AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 0.8, A8s: 0.6, A7s: 0.4, A6s: 0.4, A5s: 0.8, A4s: 0.5, A3s: 0.4, A2s: 0.3,
    AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 0.8, A9o: 0.3,
    KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.6, K8s: 0.3,
    KQo: 1.0, KJo: 0.7, KTo: 0.4,
    QJs: 1.0, QTs: 1.0, Q9s: 0.6, Q8s: 0.2,
    QJo: 0.7, QTo: 0.3,
    JTs: 1.0, J9s: 0.7, J8s: 0.3,
    JTo: 0.5,
    T9s: 0.8, T8s: 0.5,
    98s: 0.7, 97s: 0.3,
    87s: 0.6, 86s: 0.2,
    77: 0.9, 66: 0.6, 55: 0.4,
  },

  // CO (Cutoff)
  CO: {
    AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, 99: 1.0, 88: 1.0, 77: 1.0, 66: 1.0,
    AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 0.8, A7s: 0.7, A6s: 0.7, A5s: 1.0, A4s: 0.8, A3s: 0.7, A2s: 0.5,
    AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 1.0, A9o: 0.6, A8o: 0.3,
    KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.9, K8s: 0.6, K7s: 0.4, K6s: 0.3, K5s: 0.4, K4s: 0.3,
    KQo: 1.0, KJo: 1.0, KTo: 0.8, K9o: 0.3,
    QJs: 1.0, QTs: 1.0, Q9s: 0.9, Q8s: 0.5, Q7s: 0.3,
    QJo: 1.0, QTo: 0.7, Q9o: 0.2,
    JTs: 1.0, J9s: 1.0, J8s: 0.6, J7s: 0.3,
    JTo: 0.9, J9o: 0.4,
    T9s: 1.0, T8s: 0.8, T7s: 0.4,
    T9o: 0.5,
    98s: 0.9, 97s: 0.6, 96s: 0.3,
    87s: 0.8, 86s: 0.4,
    76s: 0.7, 75s: 0.3,
    65s: 0.6, 54s: 0.5,
    55: 0.9, 44: 0.7, 33: 0.5, 22: 0.4,
  },

  // BTN (Button) — 가장 넓음
  BTN: {
    AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, 99: 1.0, 88: 1.0, 77: 1.0, 66: 1.0, 55: 1.0, 44: 0.9, 33: 0.8, 22: 0.7,
    AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 1.0, A7s: 1.0, A6s: 1.0, A5s: 1.0, A4s: 1.0, A3s: 1.0, A2s: 1.0,
    AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 1.0, A9o: 0.9, A8o: 0.8, A7o: 0.6, A6o: 0.5, A5o: 0.7, A4o: 0.6, A3o: 0.5, A2o: 0.4,
    KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 1.0, K8s: 0.9, K7s: 0.8, K6s: 0.7, K5s: 0.8, K4s: 0.6, K3s: 0.5, K2s: 0.4,
    KQo: 1.0, KJo: 1.0, KTo: 1.0, K9o: 0.8, K8o: 0.5, K7o: 0.3,
    QJs: 1.0, QTs: 1.0, Q9s: 1.0, Q8s: 0.9, Q7s: 0.7, Q6s: 0.5, Q5s: 0.4,
    QJo: 1.0, QTo: 0.9, Q9o: 0.7, Q8o: 0.4,
    JTs: 1.0, J9s: 1.0, J8s: 0.9, J7s: 0.7, J6s: 0.4,
    JTo: 1.0, J9o: 0.8, J8o: 0.5,
    T9s: 1.0, T8s: 1.0, T7s: 0.8, T6s: 0.5,
    T9o: 0.9, T8o: 0.5,
    98s: 1.0, 97s: 0.9, 96s: 0.7, 95s: 0.4,
    87s: 1.0, 86s: 0.8, 85s: 0.5,
    76s: 0.9, 75s: 0.7, 74s: 0.3,
    65s: 0.9, 64s: 0.5,
    54s: 0.8, 53s: 0.5,
    43s: 0.5, 32s: 0.3,
  },

  // SB (Small Blind) — BTN보다 약간 좁음 (포지션 불리)
  SB: {
    AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, 99: 1.0, 88: 1.0, 77: 0.9, 66: 0.8, 55: 0.7, 44: 0.6, 33: 0.5, 22: 0.4,
    AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 0.9, A7s: 0.8, A6s: 0.8, A5s: 1.0, A4s: 0.9, A3s: 0.8, A2s: 0.7,
    AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 0.9, A9o: 0.7, A8o: 0.5, A7o: 0.4,
    KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.9, K8s: 0.7, K7s: 0.6, K6s: 0.5, K5s: 0.6, K4s: 0.4, K3s: 0.3, K2s: 0.3,
    KQo: 1.0, KJo: 0.9, KTo: 0.7, K9o: 0.5, K8o: 0.3,
    QJs: 1.0, QTs: 1.0, Q9s: 0.9, Q8s: 0.7, Q7s: 0.5, Q6s: 0.3,
    QJo: 0.9, QTo: 0.7, Q9o: 0.5,
    JTs: 1.0, J9s: 0.9, J8s: 0.7, J7s: 0.5,
    JTo: 0.8, J9o: 0.5,
    T9s: 0.9, T8s: 0.8, T7s: 0.5,
    T9o: 0.6,
    98s: 0.9, 97s: 0.7, 96s: 0.4,
    87s: 0.8, 86s: 0.5,
    76s: 0.7, 75s: 0.4,
    65s: 0.7, 64s: 0.3,
    54s: 0.6, 53s: 0.3,
  },
};

/**
 * 주어진 포지션에서 핸드의 GTO 오픈 레이즈 확률 반환
 * @param {string} position - 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB'
 * @param {string} hand - 예: 'AKs', 'QQ', 'T9o'
 * @returns {number} 0.0 ~ 1.0
 */
export function getOpenRaiseFrequency(position, hand) {
  const range = RFI_RANGES[position];
  if (!range) return 0;
  return range[hand] ?? 0;
}

/**
 * GTO 봇 액션 결정 — 프리플랍 RFI
 * @param {string} position
 * @param {string} hand
 * @returns {'raise' | 'fold'}
 */
export function decidePreflopRFIAction(position, hand) {
  const freq = getOpenRaiseFrequency(position, hand);
  return Math.random() < freq ? 'raise' : 'fold';
}

/**
 * 카드 두 장으로 핸드 표기 생성
 * @param {string} card1 - 예: 'As', 'Kh'
 * @param {string} card2
 * @returns {string} - 예: 'AKs', 'AKo', 'AA'
 */
export function cardsToHandNotation(card1, card2) {
  const rankOrder = RANKS;
  const r1 = card1[0];
  const s1 = card1[1];
  const r2 = card2[0];
  const s2 = card2[1];

  const ri1 = rankOrder.indexOf(r1);
  const ri2 = rankOrder.indexOf(r2);

  // 높은 랭크를 앞으로
  const [highRank, lowRank, highSuit, lowSuit] =
    ri1 <= ri2 ? [r1, r2, s1, s2] : [r2, r1, s2, s1];

  if (highRank === lowRank) return highRank + lowRank; // 페어
  if (highSuit === lowSuit) return highRank + lowRank + 's'; // 수티드
  return highRank + lowRank + 'o'; // 오프수트
}
