/**
 * Hand evaluation — pokersolver 래퍼
 * pokersolver 카드 형식: 'As', 'Kh', 'Qd' 등 (동일 형식)
 */
// pokersolver is a CJS module — use default import
import pokersolver from 'pokersolver';
const { Hand } = pokersolver;

const HAND_RANK = {
  'Royal Flush': 9,
  'Straight Flush': 8,
  'Four of a Kind': 7,
  'Full House': 6,
  'Flush': 5,
  'Straight': 4,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'Pair': 1,
  'High Card': 0,
};

/**
 * 7장(핸드 2장 + 커뮤니티 5장) 최강 핸드 반환
 * @param {string[]} holeCards - ['As', 'Kh']
 * @param {string[]} communityCards - ['Qd', 'Jc', 'Ts', '2h', '3d']
 * @returns {{ name: string, descr: string, rank: number, hand: Hand }}
 */
export function evaluateHand(holeCards, communityCards) {
  const cards = [...holeCards, ...communityCards];
  const hand = Hand.solve(cards);
  return {
    name: hand.name,
    descr: hand.descr,
    rank: HAND_RANK[hand.name] ?? -1,
    hand,
  };
}

/**
 * 여러 핸드 중 승자 결정 (쇼다운)
 * @param {Array<{playerId: number, holeCards: string[]}>} showdownPlayers
 * @param {string[]} communityCards
 * @returns {number[]} 승자 playerId 배열 (타이 가능)
 */
export function determineWinners(showdownPlayers, communityCards) {
  if (showdownPlayers.length === 0) return [];
  if (showdownPlayers.length === 1) return [showdownPlayers[0].playerId];

  const hands = showdownPlayers.map(({ playerId, holeCards }) => ({
    playerId,
    hand: Hand.solve([...holeCards, ...communityCards]),
  }));

  const winners = Hand.winners(hands.map((h) => h.hand));
  return hands
    .filter(({ hand }) => winners.includes(hand))
    .map(({ playerId }) => playerId);
}

export { HAND_RANK };
