import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(180deg, #0D1117 0%, #0d1f0d 100%)' }}>

      {/* Hero */}
      <div className="text-center max-w-xl mb-12">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          GTO 기반 포커 학습
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          GTO Poker Trainer
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-8">
          GTO 봇 5명과 6-max Texas Hold'em 게임을 플레이하고,<br />
          핸드 종료 후 chess.com 스타일로 복기하며 실력을 쌓으세요.
        </p>
        <Link
          href="/game"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-150 text-lg min-h-[52px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          무료로 시작하기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* 특징 3가지 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
        {[
          {
            title: '6-max GTO 봇 대전',
            desc: '사전 계산된 GTO 전략 테이블 기반 봇 5명과 실전 연습',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            ),
          },
          {
            title: '핸드 복기 시스템',
            desc: 'chess.com 스타일로 각 액션을 GTO 최적과 비교하며 학습',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
          },
          {
            title: 'GTO 점수화',
            desc: 'Best / Good / Mistake / Blunder 4단계 등급으로 실력 측정',
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ),
          },
        ].map(({ title, desc, icon }) => (
          <div key={title}
            className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-5">
            <div className="text-green-400 mb-3">{icon}</div>
            <h3 className="text-white font-semibold mb-1">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* 수익 모델 */}
      <div className="max-w-sm w-full bg-slate-800/40 border border-slate-700/30 rounded-2xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-3">현재 베타</p>
        <div className="flex justify-around">
          <div>
            <div className="text-green-400 font-bold">무제한</div>
            <div className="text-slate-500 text-xs">게임 플레이</div>
          </div>
          <div className="w-px bg-slate-700" />
          <div>
            <div className="text-green-400 font-bold">무료</div>
            <div className="text-slate-500 text-xs">핸드 복기</div>
          </div>
        </div>
      </div>
    </main>
  );
}
