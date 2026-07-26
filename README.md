# 云宝生日快乐 🎂

A birthday celebration game for 云宝 (Yun). Catch the cakes, avoid missing them, and reach the victory score.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **React**: React 19
- **UI Animations**: motion/react (Framer Motion) + GSAP
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun
- **Game Engine**: Custom requestAnimationFrame loop + useReducer (no canvas, pure DOM and CSS)

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (port 3100)
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck

# Lint
bun run lint
```

## How to Play

1. Read through the intro conversation. Press `Esc` or click to skip the intro, or close the conversation overlay.
2. Jump to make 云宝 (the cloud character) rise. You can use the `Space` key, the `Enter` key, or click/tap the screen.
3. Catch the cakes flying from the right. Normal cakes give +1 point. Rare golden cakes give +3 points.
4. Don't hit the ground or miss any cakes. Doing either results in game over.
5. Pause or resume the game at any time. Press the P key or click the on-screen ⏸ button.
6. Reach a score of 20 to win and unlock the birthday celebration.

## Game Features

- **Golden Cakes**: Rare golden cakes spawn with a 15% chance and grant +3 points.
- **Progressive Difficulty**: Cake speed and spawn rate ramp up every 5 cakes eaten, up to a maximum cap.
- **Milestone Flashes**: Screen flashes celebrate milestones at 5, 10, and 15 cakes eaten.
- **Best Score**: Your best score is saved locally and persists across reloads.
- **Juicy Feedback**: Enjoy floating score pops, particle bursts on eating, screen shake on death, hitstop microfreezes on eating, and HUD score pulsing.
- **Sound Effects**: Jump, eat, gameover, and victory sounds play via Web Audio, with a mute toggle.
- **Birthday Celebration**: A special victory screen with animated text and confetti.

## Accessibility

- **Reduced Motion**: The game honors the `prefers-reduced-motion` media query. All screen shake, particle bursts, hitstop microfreezes, and milestone flashes are disabled. Core gameplay, score tracking, and sound effects still work perfectly.
- **Mute Toggle**: A persistent mute toggle (🔊/🔇) saves your preference across sessions.
- **Keyboard Playable**: Fully playable with a keyboard. Use Space or Enter to jump, and P to pause.

## Architecture

The game engine is composed of small, focused pieces. State is managed by `useReducer` with a `gameReducer` phase machine that handles transitions between intro, ready, playing, paused, gameover, and victory states. A custom `useGameLoop` hook drives the requestAnimationFrame loop. Pure utility modules `physics.ts` (gravity, jump, and AABB collision) and `spawner.ts` (cake generation) handle the math. Custom hooks `usePersisted` (localStorage), `useSoundEffect` (Web Audio), and `useReducedMotion` manage side effects. `GameShell.tsx` acts as a thin composer wiring these elements together. There is no canvas and no Phaser.

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout (Server Component)
│   ├── page.tsx      # Home page (Server Component)
│   └── globals.css   # Tailwind + global styles
├── components/       # React components
│   ├── GameShell.tsx           # Main game composer
│   ├── ConversationOverlay.tsx  # Intro dialog with Framer Motion
│   ├── VictoryScreen.tsx       # Birthday celebration screen
│   └── effects/                # Visual feedback effects
│       ├── ScorePop.tsx        # Floating score indicator
│       ├── ParticleBurst.tsx   # Eat particles
│       └── MilestoneFlash.tsx  # Milestone flash overlay
├── game/             # Pure game logic and types
│   ├── constants.ts  # Game constants (victory score, gravity, etc.)
│   ├── types.ts      # TypeScript definitions
│   ├── physics.ts    # Gravity, jump, and collision math
│   ├── gameReducer.ts # State machine reducer
│   └── spawner.ts    # Cake spawning logic
├── hooks/            # Custom React hooks
│   ├── useGameLoop.ts     # requestAnimationFrame loop
│   ├── usePersisted.ts    # localStorage state persistence
│   ├── useSoundEffect.ts  # Web Audio API sound effects
│   └── useReducedMotion.ts # prefers-reduced-motion detection
└── globals.d.ts      # Global type declarations
```
