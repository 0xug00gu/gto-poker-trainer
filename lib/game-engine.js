/**
 * GTO Poker Game Engine — v2 (hasActed 기반 베팅 라운드 로직)
 * 6-max NLH 게임 상태 머신 (useReducer 기반)
 */

import { createDeck, shuffleDeck, dealCards } from './deck.js';
import { evaluateHand, determineWinners } from './hand-evaluator.js';
import { decideBotAction } from './gto-bot.js';

export const POSITIONS = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
export const PHASES = ['idle', 'preflop', 'flop', 'turn', 'river', 'showdown'];
export const HUMAN_SEAT = 0;
export const NUM_PLAYERS = 6;
export const BIG_BLIND = 20;
export const SMALL_BLIND = 10;
export const STARTING_CHIPS = 1000;

/** 좌석 인덱스 → 포지션 이름 */
export function getPosition(seatIndex, dealerIndex) {
  const offset = (seatIndex - dealerIndex + NUM_PLAYERS) % NUM_PLAYERS;
  return POSITIONS[offset];
}

/** 초기 플레이어 목록 생성 */
function createPlayers(prevPlayers) {
  return Array.from({ length: NUM_PLAYERS }, (_, i) => ({
    id: i,
    isHuman: i === HUMAN_SEAT,
    name: i === HUMAN_SEAT ? 'You' : `Bot ${i}`,
    chips: prevPlayers ? prevPlayers[i].chips : STARTING_CHIPS,
    holeCards: [],
    bet: 0,
    totalBetThisHand: 0,
    action: null,
    hasActed: false,   // ← 이번 스트릿에서 자발적으로 액션했는지
    isFolded: false,
    isAllIn: false,
    isActive: true,
    wasAggressor: false,
  }));
}

/** 초기 게임 상태 */
export function createInitialState() {
  return {
    phase: 'idle',
    players: createPlayers(null),
    communityCards: [],
    deck: [],
    pot: 0,
    currentBet: 0,
    minRaise: BIG_BLIND,
    dealerIndex: 0,
    actionIndex: -1,
    raiseCount: 0,
    handHistory: [],
    handId: null,
    winners: [],
    message: '게임 시작 버튼을 눌러주세요.',
    isWaitingForHuman: false,
  };
}

// ─── Reducer ────────────────────────────────────────────────────────────────

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_HAND':
      return startHand(state);
    case 'PLAYER_ACTION':
      return handlePlayerAction(state, action.payload);
    case 'NEXT_STREET':
      return advanceStreet(state);
    case 'BOT_THINK':
      return processBotAction(state);
    default:
      return state;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * 베팅 라운드 종료 여부
 * 모든 액티브 플레이어가 hasActed=true이고 베팅액이 동일할 때 종료
 */
function isRoundComplete(players, currentBet) {
  const active = players.filter((p) => !p.isFolded && p.isActive);
  if (active.length <= 1) return true;
  return active.every(
    (p) => p.hasActed && (p.bet === currentBet || p.chips === 0 || p.isAllIn)
  );
}

/**
 * 다음으로 액션해야 할 플레이어 찾기
 * 베팅액이 currentBet 미만이거나 아직 hasActed=false인 플레이어
 */
function findNextToAct(players, fromIndex, currentBet) {
  let next = (fromIndex + 1) % NUM_PLAYERS;
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const p = players[next];
    if (!p.isFolded && p.isActive && (!p.hasActed || p.bet < currentBet)) {
      return next;
    }
    next = (next + 1) % NUM_PLAYERS;
  }
  return -1;
}

function findFirstActivePlayer(players, startIndex) {
  let idx = startIndex;
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const p = players[idx];
    if (!p.isFolded && p.isActive) return idx;
    idx = (idx + 1) % NUM_PLAYERS;
  }
  return -1;
}

function buildWinMessage(winnerIds, players) {
  const names = winnerIds.map((id) => players[id]?.name ?? `Player ${id}`);
  return names.join(', ') + (winnerIds.length > 1 ? ' — 타이!' : ' — 승리!');
}

// ─── Action Handlers ────────────────────────────────────────────────────────

function startHand(state) {
  const dealerIndex = (state.dealerIndex + 1) % NUM_PLAYERS;
  const sbIndex = (dealerIndex + 1) % NUM_PLAYERS;
  const bbIndex = (dealerIndex + 2) % NUM_PLAYERS;

  let deck = shuffleDeck(createDeck());

  const players = createPlayers(state.players).map((p, i) => {
    const [cards, rest] = dealCards(deck, 2);
    deck = rest;
    return { ...p, holeCards: cards };
  });

  // 블라인드 포스트 (hasActed = false 유지 — BB는 나중에 옵션 행사 가능)
  players[sbIndex].bet = SMALL_BLIND;
  players[sbIndex].chips -= SMALL_BLIND;
  players[sbIndex].totalBetThisHand = SMALL_BLIND;

  players[bbIndex].bet = BIG_BLIND;
  players[bbIndex].chips -= BIG_BLIND;
  players[bbIndex].totalBetThisHand = BIG_BLIND;

  // 프리플랍 첫 액션: UTG (BB 다음)
  const utgIndex = (bbIndex + 1) % NUM_PLAYERS;

  const handId = Date.now().toString();

  return {
    ...state,
    phase: 'preflop',
    players,
    communityCards: [],
    deck,
    pot: SMALL_BLIND + BIG_BLIND,
    currentBet: BIG_BLIND,
    minRaise: BIG_BLIND,
    dealerIndex,
    actionIndex: utgIndex,
    raiseCount: 1, // BB 블라인드를 레이즈로 간주
    handHistory: [],
    handId,
    winners: [],
    message: '',
    isWaitingForHuman: players[utgIndex].isHuman,
  };
}

function handlePlayerAction(state, { seatIndex, action, amount }) {
  const players = state.players.map((p) => ({ ...p }));
  const player = players[seatIndex];
  let { pot, currentBet, minRaise, raiseCount, handHistory } = state;

  // 히스토리 엔트리
  const historyEntry = {
    seatIndex,
    action,
    amount: 0,
    phase: state.phase,
    communityCards: [...state.communityCards],
    pot,
    currentBet,
    holeCards: [...player.holeCards],
    isHuman: player.isHuman,
    position: getPosition(seatIndex, state.dealerIndex),
    gtoAction: null,
  };

  // 액션 처리
  switch (action) {
    case 'fold':
      player.isFolded = true;
      player.action = 'fold';
      player.hasActed = true;
      break;

    case 'check':
      player.action = 'check';
      player.hasActed = true;
      break;

    case 'call': {
      const callAmount = Math.min(currentBet - player.bet, player.chips);
      player.chips -= callAmount;
      player.bet += callAmount;
      player.totalBetThisHand += callAmount;
      pot += callAmount;
      historyEntry.amount = callAmount;
      player.action = 'call';
      player.hasActed = true;
      break;
    }

    case 'raise': {
      const prevCurrentBet = currentBet;
      // amount는 총 베팅 목표액
      const targetBet = Math.max(amount ?? (currentBet + minRaise), currentBet + minRaise);
      const additional = Math.min(targetBet - player.bet, player.chips);
      player.chips -= additional;
      pot += additional;
      player.totalBetThisHand += additional;
      player.bet += additional;
      // 다음 최소 레이즈 = 이번 레이즈 크기
      minRaise = player.bet - prevCurrentBet;
      currentBet = player.bet;
      raiseCount += 1;
      player.wasAggressor = true;
      historyEntry.amount = player.bet;
      player.action = 'raise';
      player.hasActed = true;
      break;
    }

    default:
      break;
  }

  historyEntry.chipsBefore = state.players[seatIndex].chips;
  handHistory = [...handHistory, historyEntry];

  // 1명만 남았으면 바로 종료
  const activePlayers = players.filter((p) => !p.isFolded && p.isActive);
  if (activePlayers.length === 1) {
    return resolveHandSingleWinner(
      { ...state, players, pot, currentBet, minRaise, raiseCount, handHistory },
      activePlayers[0].id
    );
  }

  // 라운드 종료 여부 확인
  if (isRoundComplete(players, currentBet)) {
    return {
      ...state,
      players,
      pot,
      currentBet,
      minRaise,
      raiseCount,
      handHistory,
      actionIndex: -1,
      isWaitingForHuman: false,
      message: '다음 스트릿으로...',
    };
  }

  // 다음 플레이어 탐색
  const nextIndex = findNextToAct(players, seatIndex, currentBet);
  if (nextIndex === -1) {
    // 안전장치: 찾지 못하면 라운드 종료
    return {
      ...state,
      players,
      pot,
      currentBet,
      minRaise,
      raiseCount,
      handHistory,
      actionIndex: -1,
      isWaitingForHuman: false,
      message: '다음 스트릿으로...',
    };
  }

  return {
    ...state,
    players,
    pot,
    currentBet,
    minRaise,
    raiseCount,
    handHistory,
    actionIndex: nextIndex,
    isWaitingForHuman: players[nextIndex].isHuman,
    message: players[nextIndex].isHuman ? '액션을 선택하세요.' : '',
  };
}

function processBotAction(state) {
  const { actionIndex, players, phase, communityCards, currentBet, pot, raiseCount } = state;
  if (actionIndex === -1) return state;

  const bot = players[actionIndex];
  if (bot.isHuman || bot.isFolded) return state;

  const position = getPosition(actionIndex, state.dealerIndex);

  let handRank = 0;
  if (phase !== 'preflop' && communityCards.length > 0) {
    const result = evaluateHand(bot.holeCards, communityCards);
    handRank = result.rank;
  }

  const toCall = currentBet - bot.bet; // 추가로 내야 할 금액

  const botDecision = decideBotAction({
    phase,
    position,
    holeCards: bot.holeCards,
    handRank,
    wasAggressor: bot.wasAggressor,
    potSize: pot,
    currentBet: toCall,
    bigBlind: BIG_BLIND,
    foldedBefore: bot.isFolded,
    raiseCount,
  });

  // 체크 가능한 상황에서 폴드 → 체크로 변환
  let finalAction = botDecision.action;
  if (finalAction === 'fold' && toCall === 0) finalAction = 'check';

  const amount = finalAction === 'raise'
    ? Math.min((botDecision.amount ?? (currentBet + state.minRaise)), bot.chips + bot.bet)
    : undefined;

  return handlePlayerAction(state, { seatIndex: actionIndex, action: finalAction, amount });
}

function advanceStreet(state) {
  const NEXT_PHASE = { preflop: 'flop', flop: 'turn', turn: 'river', river: 'showdown' };
  const nextPhase = NEXT_PHASE[state.phase];

  if (!nextPhase) return state;
  if (nextPhase === 'showdown') return handleShowdown(state);

  let deck = [...state.deck];
  let communityCards = [...state.communityCards];

  if (nextPhase === 'flop') {
    const [cards, rest] = dealCards(deck, 3);
    communityCards = [...communityCards, ...cards];
    deck = rest;
  } else {
    const [cards, rest] = dealCards(deck, 1);
    communityCards = [...communityCards, ...cards];
    deck = rest;
  }

  // 스트릿 시작 — bet/hasActed/action 리셋
  const players = state.players.map((p) => ({
    ...p,
    bet: 0,
    hasActed: false,
    action: p.isFolded ? p.action : null,
  }));

  // 포스트플랍: SB 또는 그 다음 액티브 플레이어부터
  const sbIndex = (state.dealerIndex + 1) % NUM_PLAYERS;
  const firstToAct = findFirstActivePlayer(players, sbIndex);

  return {
    ...state,
    phase: nextPhase,
    communityCards,
    deck,
    players,
    currentBet: 0,
    minRaise: BIG_BLIND,
    raiseCount: 0,
    actionIndex: firstToAct,
    isWaitingForHuman: firstToAct !== -1 && players[firstToAct].isHuman,
    message: firstToAct !== -1 && players[firstToAct].isHuman ? '액션을 선택하세요.' : '',
  };
}

function handleShowdown(state) {
  const activePlayers = state.players
    .filter((p) => !p.isFolded && p.isActive)
    .map((p) => ({ playerId: p.id, holeCards: p.holeCards }));

  const winnerIds = determineWinners(activePlayers, state.communityCards);

  const players = state.players.map((p) => {
    if (!winnerIds.includes(p.id)) return p;
    const share = Math.floor(state.pot / winnerIds.length);
    return { ...p, chips: p.chips + share };
  });

  return {
    ...state,
    phase: 'showdown',
    players,
    winners: winnerIds,
    actionIndex: -1,
    isWaitingForHuman: false,
    message: buildWinMessage(winnerIds, players),
  };
}

function resolveHandSingleWinner(state, winnerId) {
  const players = state.players.map((p) => {
    if (p.id !== winnerId) return p;
    return { ...p, chips: p.chips + state.pot };
  });

  return {
    ...state,
    phase: 'showdown',
    players,
    winners: [winnerId],
    actionIndex: -1,
    isWaitingForHuman: false,
    message: buildWinMessage([winnerId], players),
  };
}

/** 인간 플레이어가 사용 가능한 액션 목록 */
export function getAvailableActions(state) {
  const human = state.players[HUMAN_SEAT];
  if (!human || human.isFolded) return [];

  const toCall = state.currentBet - human.bet;
  const canCheck = toCall <= 0;
  const minRaiseTarget = state.currentBet + state.minRaise;

  const actions = [];
  actions.push({ type: 'fold', label: '폴드' });

  if (canCheck) {
    actions.push({ type: 'check', label: '체크' });
  } else {
    actions.push({ type: 'call', label: `콜 (+${toCall})`, amount: state.currentBet });
  }

  if (human.chips > toCall) {
    actions.push({
      type: 'raise',
      label: state.currentBet === 0 ? '베팅' : '레이즈',
      minAmount: minRaiseTarget,
      maxAmount: human.chips + human.bet,
    });
  }

  return actions;
}
