/**
 * GTO Poker Game Engine
 * 6-max NLH 게임 상태 머신 (useReducer 기반)
 *
 * 포지션 배정 (6명, dealerIndex 기준):
 *   dealerIndex+0 = BTN
 *   dealerIndex+1 = SB
 *   dealerIndex+2 = BB
 *   dealerIndex+3 = UTG
 *   dealerIndex+4 = HJ
 *   dealerIndex+5 = CO
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
function createPlayers() {
  return Array.from({ length: NUM_PLAYERS }, (_, i) => ({
    id: i,
    isHuman: i === HUMAN_SEAT,
    name: i === HUMAN_SEAT ? 'You' : `Bot ${i}`,
    chips: STARTING_CHIPS,
    holeCards: [],
    bet: 0,
    totalBetThisHand: 0,
    action: null,
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
    players: createPlayers(),
    communityCards: [],
    deck: [],
    pot: 0,
    currentBet: 0,
    minRaise: BIG_BLIND,
    dealerIndex: 0,
    actionIndex: -1, // 현재 액션 차례 플레이어 인덱스
    raiseCount: 0,
    lastAggressorIndex: -1,
    handHistory: [], // [{seatIndex, action, amount, phase, holeCards (snapshot), communityCards, gtoAction}]
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

// ─── Action Handlers ────────────────────────────────────────────────────────

function startHand(state) {
  const dealerIndex = (state.dealerIndex + 1) % NUM_PLAYERS;
  const sbIndex = (dealerIndex + 1) % NUM_PLAYERS;
  const bbIndex = (dealerIndex + 2) % NUM_PLAYERS;

  let deck = shuffleDeck(createDeck());

  // 각 플레이어에게 2장씩 딜
  const players = createPlayers().map((p, i) => {
    const [cards, rest] = dealCards(deck, 2);
    deck = rest;
    return { ...p, holeCards: cards, chips: state.players[i].chips };
  });

  // 블라인드 포스트
  players[sbIndex].bet = SMALL_BLIND;
  players[sbIndex].chips -= SMALL_BLIND;
  players[sbIndex].totalBetThisHand = SMALL_BLIND;

  players[bbIndex].bet = BIG_BLIND;
  players[bbIndex].chips -= BIG_BLIND;
  players[bbIndex].totalBetThisHand = BIG_BLIND;

  // 프리플랍 첫 액션: UTG (BB+1)
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
    minRaise: BIG_BLIND * 2,
    dealerIndex,
    actionIndex: utgIndex,
    raiseCount: 1, // BB is considered a "raise"
    lastAggressorIndex: bbIndex,
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
  let { pot, currentBet, minRaise, raiseCount, lastAggressorIndex, handHistory } = state;

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
    gtoAction: null, // 복기 시 채워짐
  };

  switch (action) {
    case 'fold':
      player.isFolded = true;
      player.action = 'fold';
      break;

    case 'check':
      player.action = 'check';
      break;

    case 'call': {
      const callAmount = Math.min(currentBet - player.bet, player.chips);
      player.chips -= callAmount;
      player.bet += callAmount;
      player.totalBetThisHand += callAmount;
      pot += callAmount;
      historyEntry.amount = callAmount;
      player.action = 'call';
      break;
    }

    case 'raise': {
      const raiseAmount = Math.max(amount ?? minRaise, minRaise);
      const totalRaise = raiseAmount; // 총 베팅액 (not additional)
      const additional = Math.min(totalRaise - player.bet, player.chips);
      player.chips -= additional;
      pot += additional;
      player.totalBetThisHand += additional;
      player.bet = player.bet + additional;
      minRaise = (player.bet - currentBet) + player.bet;
      currentBet = player.bet;
      raiseCount += 1;
      lastAggressorIndex = seatIndex;
      player.wasAggressor = true;
      historyEntry.amount = player.bet;
      player.action = 'raise';
      break;
    }

    default:
      break;
  }

  historyEntry.chipsBefore = state.players[seatIndex].chips;
  handHistory = [...handHistory, historyEntry];

  // 다음 플레이어 계산
  const nextIndex = findNextActionPlayer(players, seatIndex, lastAggressorIndex, state.phase);

  const isRoundOver = nextIndex === -1;
  const activePlayers = players.filter((p) => !p.isFolded && p.isActive);

  // 모두 폴드 (1명 남음)
  if (activePlayers.length === 1) {
    return resolveHandSingleWinner(
      { ...state, players, pot, currentBet, minRaise, raiseCount, lastAggressorIndex, handHistory },
      activePlayers[0].id
    );
  }

  if (isRoundOver) {
    return {
      ...state,
      players,
      pot,
      currentBet,
      minRaise,
      raiseCount,
      lastAggressorIndex,
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
    lastAggressorIndex,
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

  const botDecision = decideBotAction({
    phase,
    position,
    holeCards: bot.holeCards,
    handRank,
    wasAggressor: bot.wasAggressor,
    potSize: pot,
    currentBet: currentBet - bot.bet, // 추가로 내야 할 금액
    bigBlind: BIG_BLIND,
    foldedBefore: bot.isFolded,
    raiseCount,
  });

  // 체크 가능한 상황인데 폴드 → 체크로 변환
  let finalAction = botDecision.action;
  if (finalAction === 'fold' && currentBet <= bot.bet) finalAction = 'check';
  // 레이즈 금액이 칩보다 많으면 콜로 변환
  if (finalAction === 'raise' && (botDecision.amount ?? 0) >= bot.chips) finalAction = 'call';

  const amount = finalAction === 'raise'
    ? Math.min(botDecision.amount ?? currentBet * 2, bot.chips + bot.bet)
    : undefined;

  return handlePlayerAction(state, { seatIndex: actionIndex, action: finalAction, amount });
}

function advanceStreet(state) {
  const NEXT_PHASE = { preflop: 'flop', flop: 'turn', turn: 'river', river: 'showdown' };
  const nextPhase = NEXT_PHASE[state.phase];

  if (!nextPhase) return state;

  if (nextPhase === 'showdown') {
    return handleShowdown(state);
  }

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

  // 베팅 리셋
  const players = state.players.map((p) => ({
    ...p,
    bet: 0,
    action: p.isFolded ? p.action : null,
  }));

  // 포스트플랍 첫 액션: BTN 왼쪽 첫 번째 액티브 플레이어 (SB부터)
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
    lastAggressorIndex: -1,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * 베팅 라운드에서 다음 액션 플레이어 찾기
 * 라운드 종료 조건: 마지막 어그레서까지 모든 플레이어가 액션 완료
 */
function findNextActionPlayer(players, currentIndex, lastAggressorIndex, phase) {
  let next = (currentIndex + 1) % NUM_PLAYERS;
  let checked = 0;

  while (checked < NUM_PLAYERS) {
    const p = players[next];
    if (!p.isFolded && p.isActive) {
      // 마지막 어그레서로 돌아왔으면 라운드 종료
      if (next === lastAggressorIndex) return -1;
      return next;
    }
    next = (next + 1) % NUM_PLAYERS;
    checked++;
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

/** 인간 플레이어가 사용 가능한 액션 목록 */
export function getAvailableActions(state) {
  const human = state.players[HUMAN_SEAT];
  if (!human || human.isFolded) return [];

  const canCheck = state.currentBet <= human.bet;
  const callAmount = state.currentBet - human.bet;
  const minRaiseAmount = state.currentBet + state.minRaise;

  const actions = [];
  actions.push({ type: 'fold', label: '폴드' });

  if (canCheck) {
    actions.push({ type: 'check', label: '체크' });
  } else {
    actions.push({ type: 'call', label: `콜 (${callAmount})`, amount: callAmount });
  }

  if (human.chips > callAmount) {
    actions.push({
      type: 'raise',
      label: state.currentBet === 0 ? '베팅' : '레이즈',
      minAmount: minRaiseAmount,
      maxAmount: human.chips + human.bet,
    });
  }

  return actions;
}
