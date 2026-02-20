'use client';

import { useState } from 'react';

/**
 * ActionPanel — 인간 플레이어 액션 버튼
 * @param {Array} availableActions - getAvailableActions() 결과
 * @param {function} onAction - (actionType, amount) => void
 * @param {boolean} isWaiting - 내 차례 여부
 */
export default function ActionPanel({ availableActions, onAction, isWaiting }) {
  const [raiseAmount, setRaiseAmount] = useState(null);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const raiseAction = availableActions.find((a) => a.type === 'raise');

  const handleRaiseClick = () => {
    if (!raiseAction) return;
    if (!showRaiseSlider) {
      setRaiseAmount(raiseAction.minAmount);
      setShowRaiseSlider(true);
    } else {
      onAction('raise', raiseAmount);
      setShowRaiseSlider(false);
    }
  };

  if (!isWaiting) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="text-slate-500 text-sm animate-pulse">봇이 생각 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 레이즈 슬라이더 */}
      {showRaiseSlider && raiseAction && (
        <div className="flex items-center gap-3 bg-slate-800/80 rounded-xl px-4 py-2 border border-slate-600/40">
          <span className="text-slate-400 text-xs whitespace-nowrap">레이즈:</span>
          <input
            type="range"
            min={raiseAction.minAmount}
            max={raiseAction.maxAmount}
            step={raiseAction.minAmount}
            value={raiseAmount ?? raiseAction.minAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="flex-1 accent-amber-500 cursor-pointer"
            aria-label="레이즈 금액 조절"
          />
          <span className="text-amber-400 font-bold text-sm min-w-[48px] text-right">
            {(raiseAmount ?? raiseAction.minAmount).toLocaleString()}
          </span>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 justify-center">
        {availableActions.map((act) => {
          if (act.type === 'raise') {
            return (
              <button
                key="raise"
                onClick={handleRaiseClick}
                className="min-w-[80px] min-h-[44px] px-4 py-2 rounded-xl font-semibold text-sm
                  bg-amber-600 hover:bg-amber-500 text-white
                  transition-colors duration-150 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label={showRaiseSlider ? '레이즈 확인' : '레이즈'}
              >
                {showRaiseSlider ? '확인' : act.label}
              </button>
            );
          }

          const colorMap = {
            fold: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
            check: 'bg-blue-700 hover:bg-blue-600 text-white',
            call: 'bg-green-700 hover:bg-green-600 text-white',
          };

          return (
            <button
              key={act.type}
              onClick={() => {
                setShowRaiseSlider(false);
                onAction(act.type, act.amount);
              }}
              className={`min-w-[80px] min-h-[44px] px-4 py-2 rounded-xl font-semibold text-sm
                ${colorMap[act.type] ?? 'bg-slate-700 hover:bg-slate-600 text-white'}
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-blue-400`}
              aria-label={act.label}
            >
              {act.label}
            </button>
          );
        })}

        {/* 레이즈 슬라이더 취소 */}
        {showRaiseSlider && (
          <button
            onClick={() => setShowRaiseSlider(false)}
            className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200
              bg-slate-800 hover:bg-slate-700 text-sm transition-colors duration-150 cursor-pointer"
            aria-label="취소"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
