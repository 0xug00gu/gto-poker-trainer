# Progress — 완료 내역

> 각 버전 완료 후 기록. 진행 중인 항목은 plan.md에서 관리.

---

## 현재 진행 중

→ **v1.0.0** (최종 릴리즈) — Vercel 배포 대기

---

## 완료된 버전

### v0.4.0 — 핸드 복기 시스템 ✅
- lib/hand-review.js: GTO 점수화 (Best/Good/Mistake/Blunder)
- 룰 기반 코치 설명 생성
- components/review/ReviewStep: 개별 액션 복기 카드
- components/review/ReviewSummary: 핸드 요약 + 점수
- app/review/[handId]/ReviewClient: 복기 페이지
- localStorage 핸드 히스토리 저장
- 게임 → 복기 페이지 연결 (복기하기 버튼)

### v0.3.0 — 게임 테이블 UI ✅
- components/game/PlayingCard: 카드 렌더링
- components/game/PlayerSeat: 6-max 시트 (액션/칩/포지션)
- components/game/CommunityCards: 커뮤니티 카드 + 팟
- components/game/ActionPanel: 폴드/콜/체크/레이즈 슬라이더
- components/game/PokerTable: 타원형 테이블 레이아웃
- design-system/MASTER.md: Dark Gaming + Glassmorphism 디자인 시스템

### v0.2.0 — 포커 게임 엔진 ✅
- lib/deck.js: 덱 유틸 (52장, 셔플, 딜, 표기)
- lib/hand-evaluator.js: pokersolver 래퍼 (쇼다운)
- lib/gto-bot.js: GTO 봇 로직 (프리플랍 레인지 + 포스트플랍 룰)
- lib/game-engine.js: 게임 상태 머신 (6-max NLH 전체)
- hooks/use-game.js: React 게임 훅 (봇 타이머, localStorage 저장)

### v0.1.0 — 프로젝트 셋업 & 리서치 ✅
- Next.js 16 (JS) + Tailwind v4 + App Router
- 기본 라우트: /, /game, /review/[handId]
- pokersolver 라이브러리 (핸드 평가기)
- GTO 프리플랍 레인지 데이터 (6-max, 5 포지션)
- GitHub: https://github.com/0xug00gu/gto-poker-trainer
