import GameClient from './GameClient.js';

export const metadata = {
  title: 'GTO Poker — 게임',
  description: 'GTO 봇과 6-max NLH 포커 게임',
};

export default function GamePage() {
  return <GameClient />;
}
