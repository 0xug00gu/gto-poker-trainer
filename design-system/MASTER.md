# GTO Poker Trainer — Design System MASTER

## Style
- **Primary Style**: Dark Gaming + Glassmorphism
- **Mood**: Professional, focused, high-contrast

## Color Palette

### Background
- `bg-primary`: #0D1117 — page background (near black)
- `bg-table`: #1C4532 — poker felt green
- `bg-table-edge`: #14532D — darker felt edge
- `bg-surface`: #1E2530 — card surfaces, panels
- `bg-elevated`: #252D3A — elevated panels

### Text
- `text-primary`: #F1F5F9 — main text
- `text-secondary`: #94A3B8 — muted text
- `text-muted`: #64748B — very muted

### Accent
- `accent-green`: #22C55E — win / best action
- `accent-blue`: #3B82F6 — good action / info
- `accent-yellow`: #F59E0B — mistake / warning
- `accent-red`: #EF4444 — blunder / danger
- `accent-gold`: #D97706 — chips / pot
- `accent-dealer`: #FBBF24 — dealer button

### Cards
- Card face: white (#FFFFFF)
- Card back: #1E3A5F (deep blue)
- Spade/Club: #1F2937 (dark)
- Heart/Diamond: #DC2626 (red)

## Typography
- **Font**: system-ui, Inter (Google Font via next/font)
- **Card ranks/suits**: font-bold, tabular-nums
- **Body**: text-sm (14px) or text-base (16px)
- **Line height**: 1.5

## Spacing
- Consistent 4/8/12/16/24/32px scale
- Table oval: max-w-5xl, aspect-ratio handled via padding

## Effects
- `shadow-card`: 0 4px 6px rgba(0,0,0,0.4)
- `shadow-chip`: 0 2px 8px rgba(217,119,6,0.4)
- `transition`: 150-200ms ease-in-out
- Hover states: brightness-110 or ring-2

## Z-Index Scale
- 10: table elements
- 20: player panels
- 30: community cards
- 50: action buttons, modals

## Accessibility
- All buttons: min 44x44px touch target
- Focus rings: ring-2 ring-blue-500
- Color not sole indicator (icons + text labels)
- prefers-reduced-motion: skip card deal animation

## Anti-Patterns
- No emojis as icons
- No layout shift on hover
- No fixed heights on text containers
- No color alone for GTO rating (use icon + color)
