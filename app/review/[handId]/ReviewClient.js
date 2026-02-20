'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewStep from '../../../components/review/ReviewStep.js';
import ReviewSummary from '../../../components/review/ReviewSummary.js';
import PlayingCard from '../../../components/game/PlayingCard.js';
import CommunityCards from '../../../components/game/CommunityCards.js';
import { generateHandReview, summarizeReview } from '../../../lib/hand-review.js';

/**
 * ReviewClient — 핸드 복기 페이지
 * localStorage에서 핸드 히스토리를 로드하여 분석
 */
export default function ReviewClient({ handId }) {
  const router = useRouter();
  const [reviewData, setReviewData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`hand_${handId}`);
      if (!raw) {
        setError('핸드 데이터를 찾을 수 없습니다.');
        return;
      }
      const handHistory = JSON.parse(raw);
      const reviewed = generateHandReview(handHistory);
      const sum = summarizeReview(reviewed);
      setReviewData(reviewed);
      setSummary(sum);
    } catch (e) {
      setError('복기 데이터 로드 오류: ' + e.message);
    }
  }, [handId]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0D1117' }}>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={() => router.push('/game')}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm cursor-pointer min-h-[44px]"
        >
          게임으로 돌아가기
        </button>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D1117' }}>
        <div className="text-slate-400 animate-pulse">복기 데이터 로딩 중...</div>
      </div>
    );
  }

  const activeEntry = reviewData[activeStep];

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: '#0D1117' }}>
      <div className="max-w-lg mx-auto flex flex-col gap-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/game')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-sm min-h-[44px] px-2"
            aria-label="게임으로 돌아가기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            게임으로
          </button>
          <h1 className="text-slate-200 font-bold">핸드 복기</h1>
          <div className="text-xs text-slate-500">{activeStep + 1} / {reviewData.length}</div>
        </div>

        {/* 요약 */}
        {summary && <ReviewSummary summary={summary} />}

        {/* 커뮤니티 카드 프리뷰 (활성 스텝 기준) */}
        {activeEntry && (
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700/40 p-4 flex flex-col items-center gap-3">
            <div className="text-xs text-slate-400">커뮤니티 카드</div>
            <CommunityCards
              communityCards={activeEntry.communityCards}
              pot={activeEntry.pot}
              phase={activeEntry.phase}
            />
          </div>
        )}

        {/* 스텝 네비게이션 */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200 rounded-xl text-sm cursor-pointer min-h-[44px] transition-colors"
            aria-label="이전 액션"
          >
            ←
          </button>
          <button
            onClick={() => setActiveStep(Math.min(reviewData.length - 1, activeStep + 1))}
            disabled={activeStep === reviewData.length - 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-200 rounded-xl text-sm cursor-pointer min-h-[44px] transition-colors"
            aria-label="다음 액션"
          >
            →
          </button>
        </div>

        {/* 복기 스텝 목록 */}
        <div className="flex flex-col gap-2">
          {reviewData.map((entry, i) => (
            <ReviewStep
              key={i}
              entry={entry}
              isActive={i === activeStep}
              onClick={() => setActiveStep(i)}
            />
          ))}
        </div>

        {/* 다시 플레이 */}
        <button
          onClick={() => router.push('/game')}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
        >
          다시 플레이하기
        </button>
      </div>
    </div>
  );
}
