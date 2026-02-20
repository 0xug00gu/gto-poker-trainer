export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">GTO Poker Trainer</h1>
        <p className="text-gray-400 mb-8">GTO 이론 기반 포커 학습 — 개발 중</p>
        <a
          href="/game"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
        >
          게임 시작
        </a>
      </div>
    </main>
  );
}
