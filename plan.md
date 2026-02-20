# Plan — 진행 중인 작업

> 완료된 항목은 즉시 삭제. 진행 중인 항목만 유지.

---

## v0.1.0 — 프로젝트 셋업 & 리서치

**목표**: 개발 환경 구성 + 핵심 라이브러리 선정

### 작업 목록

- [ ] **#1** 카드게임 UI 라이브러리 리서치 (React 기반 포커 UI, 핸드 평가기)
- [ ] **#2** GTO 프리플랍 차트 데이터 소싱 (오픈소스 존재 여부 확인)
- [ ] **#3** Supabase 프로젝트 생성 + DB 스키마 설계 (users, hands, reviews)
- [ ] **#4** 핵심 의존성 설치 (핸드 평가기 라이브러리, UI 컴포넌트 등)
- [ ] **#5** 프로젝트 폴더 구조 확정 및 기본 라우트 생성 (`/`, `/game`, `/review/[handId]`)

### 기술 결정 사항
- Stack: Next.js (JS) + Tailwind v4 + Supabase + Vercel
- GTO MVP: 프리플랍 차트만 (포스트플랍은 단순 룰 기반)
- DB: Supabase (PostgreSQL)
- 인증: v1은 제외, v2에서 Google OAuth 추가
