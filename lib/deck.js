/**
 * Deck management — 순수 함수
 * 카드 표기: 'As', 'Kh', 'Qd', 'Jc' (rank + suit)
 * suits: s(spade), h(heart), d(diamond), c(club)
 */

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['s', 'h', 'd', 'c'];

/** 52장 덱 생성 */
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(rank + suit);
    }
  }
  return deck;
}

/** Fisher-Yates 셔플 (불변) */
export function shuffleDeck(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 덱에서 n장 딜 — [dealt, remainingDeck] */
export function dealCards(deck, n) {
  return [deck.slice(0, n), deck.slice(n)];
}

/** 카드 두 장 → 핸드 표기 ('AKs', 'AKo', 'AA') */
export function cardsToHandNotation(card1, card2) {
  const ORDER = 'AKQJT98765432';
  const r1 = card1[0], s1 = card1[1];
  const r2 = card2[0], s2 = card2[1];
  const i1 = ORDER.indexOf(r1), i2 = ORDER.indexOf(r2);

  const [highR, lowR, highS, lowS] =
    i1 <= i2 ? [r1, r2, s1, s2] : [r2, r1, s2, s1];

  if (highR === lowR) return highR + lowR;
  return highR + lowR + (highS === lowS ? 's' : 'o');
}

/** 카드 표시명 (UI용) */
export function cardDisplayName(card) {
  const RANK_MAP = { T: '10', J: 'J', Q: 'Q', K: 'K', A: 'A' };
  const SUIT_MAP = { s: '♠', h: '♥', d: '♦', c: '♣' };
  const rank = RANK_MAP[card[0]] ?? card[0];
  const suit = SUIT_MAP[card[1]] ?? card[1];
  return { rank, suit };
}

export const SUIT_COLORS = { s: 'black', c: 'black', h: 'red', d: 'red' };
