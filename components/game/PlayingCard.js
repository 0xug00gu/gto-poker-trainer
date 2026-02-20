'use client';

import * as Cards from '@letele/playing-cards';

/**
 * 우리 카드 포맷 → @letele/playing-cards 컴포넌트 이름 변환
 * 우리 형식: 'As'(Ace of Spades), 'Kh'(King of Hearts), 'Td'(Ten of Diamonds)
 * 라이브러리: Sa, Sk, D10 등
 */
function getCardComponentName(card) {
  const SUIT_MAP = { s: 'S', h: 'H', d: 'D', c: 'C' };
  const RANK_MAP = {
    A: 'a', K: 'k', Q: 'q', J: 'j', T: '10',
    '9': '9', '8': '8', '7': '7', '6': '6',
    '5': '5', '4': '4', '3': '3', '2': '2',
  };
  const suit = SUIT_MAP[card[1]];
  const rank = RANK_MAP[card[0]];
  if (!suit || !rank) return null;
  return suit + rank; // e.g., Sa, Hk, D10, C9
}

const SIZE_STYLES = {
  sm: { width: 36, height: 50 },
  md: { width: 52, height: 73 },
  lg: { width: 72, height: 101 },
};

/**
 * PlayingCard — 포커 카드 컴포넌트 (@letele/playing-cards 사용)
 * @param {string|null} card - 'As', 'Kh' 등. null이면 뒷면
 * @param {boolean} faceDown - true면 뒷면
 * @param {'sm'|'md'|'lg'} size
 */
export default function PlayingCard({ card, faceDown = false, size = 'md' }) {
  const { width, height } = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  const style = {
    width,
    height,
    flexShrink: 0,
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // 뒷면
  if (!card || faceDown) {
    const Back = Cards.B1;
    return (
      <div style={style} aria-label="카드 뒷면">
        <Back width={width} height={height} />
      </div>
    );
  }

  const componentName = getCardComponentName(card);
  const CardSvg = componentName ? Cards[componentName] : null;

  // 매핑 실패 시 폴백
  if (!CardSvg) {
    return (
      <div
        style={{ ...style, background: '#fff', border: '1px solid #ddd' }}
        aria-label={card}
      >
        <span style={{ fontSize: 10, color: '#333' }}>{card}</span>
      </div>
    );
  }

  return (
    <div style={style} aria-label={card}>
      <CardSvg width={width} height={height} />
    </div>
  );
}
