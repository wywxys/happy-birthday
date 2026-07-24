# 云宝生日快乐 🎂

A birthday celebration game for 云宝 (Yun) — catch the cakes, avoid missing them, and reach the victory score!

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Game Engine**: Phaser 4 (Arcade Physics)
- **UI Animations**: Framer Motion (motion/react) + GSAP
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun

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

1. Read through the intro conversation (click to advance, or skip)
2. Click/tap the screen to make 云宝 (the cloud character) jump
3. Catch the cakes flying from the right — each cake eaten = +1 score
4. Don't miss any cakes! Missing one = game over
5. Reach score 20 to win and see the birthday celebration!

## Game Features

- Physics-based gameplay with Phaser Arcade Physics
- Particle effects (sparkles on eat, feathers on death, confetti on victory)
- Parallax scrolling background
- Progressive difficulty (speed increases every 5 cakes)
- Responsive design (works on mobile and desktop)
- Animated conversation intro with character portraits
- Birthday victory celebration with animated text

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout (Server Component)
│   ├── page.tsx      # Home page (Server Component)
│   └── globals.css   # Tailwind + global styles
├── components/       # React components
│   ├── GameShell.tsx          # Client wrapper with dynamic Phaser import
│   ├── ConversationOverlay.tsx # Intro dialog with Framer Motion
│   └── VictoryScreen.tsx      # Birthday celebration screen
└── game/             # Phaser game code
    ├── EventBus.ts   # Browser-safe event emitter (Phaser↔React bridge)
    ├── main.ts       # Phaser game configuration
    ├── PhaserGame.tsx # Phaser canvas React component
    └── scenes/
        ├── GameScene.ts       # Main game logic
        └── BackgroundScene.ts # Parallax background
```

## CI/CD

See [HARNESS.md](./HARNESS.md) for the deployment plan and `.harness/` for pipeline YAML.
