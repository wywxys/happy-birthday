---
slug: happy-birthday-upgrade
status: awaiting-approval
intent: unclear
review_required: true
pending-action: finalize .omo/plans/happy-birthday-upgrade.md (already written, awaiting user approval)
approach: |
  Full modernization of a birthday Flappy-Bird game: (1) init .gitignore, (2) upgrade Next.js 12→16 with App Router migration,
  (3) rewrite game engine using Phaser 4 + GSAP + Framer Motion, (4) fix all 24 identified bugs, (5) enhance art/UX,
  (6) produce a Harness CI/CD plan document. Package manager: bun. Multi-agent parallel execution.
---

# Draft: happy-birthday-upgrade

## Components (topology ledger)
| id | outcome | status | evidence |
|----|---------|--------|----------|
| C1-GITIGNORE | Proper .gitignore for Next.js/bun/Phaser project | active | .gitignore (currently empty) |
| C2-NEXTJS-UPGRADE | Migrate Next.js 12.2.5 → 16.2.x + App Router + TypeScript + bun | active | package.json, next.config.js, pages/ |
| C3-GAME-REWRITE | Rewrite game using Phaser 4 (Arcade Physics) — fix all 24 bugs | active | pages/components/Game.js (137 lines) |
| C4-ART-UX | Enhanced visual effects: particles, animations, responsive design, birthday theme | active | styles/Game.css, public/ assets |
| C5-CONVERSATION-UI | Modernize intro/conversation with Framer Motion + GSAP | active | pages/components/Intro.js, Conversation.js |
| C6-HARNESS | Harness CI/CD pipeline plan document (.harness/ directory) | active | N/A (new) |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Target Next.js version | 16.2.x (latest LTS) | EOL for 12/13/14; 16 is Active LTS until Oct 2027 | Yes - can pin 15 |
| Router architecture | App Router (migrate from pages/) | Unlocks View Transitions, Activity, React Compiler, Cache Components | Yes - pages/ still works |
| Language | TypeScript (strict) | Next.js 16 defaults to TS; type safety for game state | Yes - can keep JS |
| Package manager | bun | User explicitly requested bun | Yes |
| Game engine | Phaser 4 + dynamic import (ssr:false) | Best fit for 2D side-scroller; official Next.js template; built-in physics+particles | Yes - can use Canvas API |
| UI animations | Framer Motion (motion/react) + GSAP (@gsap/react) | FM for React transitions; GSAP for score tweens; both free, small | Yes |
| React version | React 19.2 (required by Next.js 16 App Router) | Hard requirement for v16 features | No |
| Node.js version | ≥20.9.0 | Hard requirement for Next.js 16 | No |
| CSS strategy | Tailwind CSS 4 + CSS Modules for game-specific styles | Modern utility-first; fast iteration; shadcn-compatible | Yes |
| Game design | Keep Flappy Bird core: cloud character jumps to eat cakes | Preserve original intent | N/A |
| Responsive design | Viewport-relative units (vh/vw) + Phaser scale manager | Fix hardcoded px (BUG-19) | Yes |
| Proxy for network | http://proxy.pek.sap.corp:8080 | User specified for SAP network | N/A |
| Harness doc scope | Pipeline YAML + .harness/ structure doc (not live deployment) | No Harness account access; plan document only | Yes |
| Multi-agent execution | Use parallel task delegation with multiple model calls | User explicitly requested multi-agent | N/A |

## Findings (cited - path:lines)

### Current State
- Next.js 12.2.5 (EOL since Nov 2022) — package.json:12
- React 18.2.0 — package.json:13
- Pages Router (pages/index.js, pages/components/)
- No TypeScript, no Tailwind, no game engine
- .gitignore is EMPTY — .gitignore:1
- 24 bugs identified in Game.js (see bug audit)
- Direct DOM manipulation, stale closures, memory leaks throughout
- No score system, no restart, no responsive design
- Intro/Conversation system works but uses basic CSS animations

### Key Bugs (from explorer audit)
- BUG-01: setInterval never cleared (Game.js:18-24) — CRITICAL
- BUG-03: isGameOver stale closure (Game.js:79) — CRITICAL
- BUG-05: Collision detection 10px window (Game.js:55-61) — CRITICAL
- BUG-10: All state as let, reset on re-render (Game.js:5-11) — CRITICAL
- BUG-11: document.querySelector in React (Game.js:17,29,41-46) — HIGH
- BUG-17: No restart mechanism (Game.js:119-129) — CRITICAL
- Total: 7 CRITICAL, 8 HIGH, 5 MEDIUM, 4 LOW

### Migration Requirements (from librarian)
- Next.js 12→16 path: 12→13→14→15→16 (codemods available)
- Simpler: fresh App Router project, port game logic
- React 19.2 required for App Router in v16
- Turbopack is default bundler in v16
- next/image API changed (v13), Link no longer needs <a> (v13)
- serverRuntimeConfig/publicRuntimeConfig removed (v16)

### Game Framework (from librarian)
- Phaser 4.2.1: best for 2D side-scroller, official Next.js template exists
- Official template: phaserjs/template-nextjs (Next.js 15.3 + EventBus)
- Framer Motion 12.42.2 (motion/react): best for React UI layer
- GSAP 3.15.0: all plugins free; @gsap/react for hooks

### Harness (from librarian)
- Latest: Harness AI-native platform with Autonomous Worker Agents (June 2026)
- YAML pipeline structure: pipeline > stages > steps
- .harness/ directory convention for Git Experience
- DAG pipelines with dependsOn (June 2026)
- Cache Intelligence + Build Intelligence for Node.js

## Decisions (with rationale)

1. **Fresh App Router scaffold instead of incremental upgrade** — The project is tiny (3 components, 137+42+54 lines). Migrating through 4 major versions with codemods is more work than scaffolding fresh with `bunx create-next-app@latest --app --ts --tailwind` and porting the game logic into Phaser.

2. **Phaser for game canvas, React for UI overlay** — Phaser handles physics/sprites/particles in a <canvas>. React handles menus/dialogs/score via Framer Motion components overlaid on top. EventBus bridges Phaser→React state.

3. **Keep birthday theme and characters** — Preserve shan.png, yun.png, cloud.png, cake.png assets. Enhance with particle effects, better backgrounds, and animations.

4. **Harness plan as a documentation deliverable** — We produce the .harness/ YAML files and a HARNESS.md plan document. No live Harness account integration.

## Scope IN
- Initialize .gitignore (Node/Next.js/bun/Phaser)
- Scaffold Next.js 16 App Router + TypeScript + Tailwind CSS 4 + bun
- Implement game with Phaser 4 (Arcade Physics, ParticleEmitter, sprite animation)
- Fix all 24 bugs via complete rewrite
- Add: score system, restart, difficulty progression, responsive design
- Enhanced art: gradient sky with parallax clouds, particle effects on cake eat, death animation, birthday confetti
- Modernize Intro/Conversation with Framer Motion animations
- Birthday message finale with animated text + confetti
- Harness CI/CD pipeline YAML + HARNESS.md plan document
- Proper project structure: app/ router, components/, lib/, types/

## Scope OUT (Must NOT have)
- No backend/API beyond what Next.js provides
- No database or user auth
- No multiplayer/leaderboard
- No paid assets or copyrighted sprites
- No actual Harness deployment (documentation only)
- No migration through intermediate versions (fresh scaffold)
- No 3D / Three.js (overkill for 2D)
- Must NOT break the existing git history
- Must NOT remove the original character concept (杉/云 birthday story)

## Open questions
(None — all resolved via research + best-practice defaults)

## Approval gate
status: awaiting-approval

## Metis Review (completed)
- 18 findings: 3 CRITICAL, 4 HIGH, 11 MEDIUM/LOW
- ALL CRITICAL and HIGH findings folded into plan:
  - F-01: GSAP SplitText is PAID → replaced with manual char-split + gsap.from stagger
  - F-02: create-next-app in non-empty dir → switched to manual scaffold strategy
  - F-03: "remove pages/" vs "preserve history" → clarified: use git rm (tracked deletion)
  - F-04: @gsap/react missing from install → added to Todo 2 deps
  - F-05: Miss-detection race condition → added cake.active guard in Todo 7
  - F-06: yaml-lint doesn't exist → replaced with node YAML parse check
- MEDIUM findings addressed: F-07 (victory=NEW flagged), F-08 (cloud.png vs cloud.svg mapped), F-09 (node preflight), F-10 (Tailwind v4 PostCSS), F-11 (wave placement noted), F-12 (F3 → agent QA), F-13 (difficulty=NEW flagged), F-14 (babel-plugin-react-compiler added), F-15 (image optimization step added)
- LOW findings addressed: F-16 (cross-platform QA commands), F-17 (biome.json ruleset specified), F-18 (bun test → tsc --noEmit)

## High-Accuracy Dual Review (Round 1)

### Momus Review: REJECT
Session: ses_06d2c0c09ffe4FuADFarvLjYm4
Issues found (3 BLOCKING):
1. Todo 2: Missing tailwindcss + @tailwindcss/postcss in package deps; unpinned versions (next@latest)
2. Waves claim parallel but dependency matrix has intra-wave sequential deps
3. Todos 9,10,11,13,15: QA scenarios have subjective checks ("looks good", "feels progressively harder")

### Oracle Review: REJECT
Session: ses_06d2be4d3ffex7sAYrc4weHX3K
Issues found (8 BLOCKING):
1. Todo 2: tailwindcss + @tailwindcss/postcss missing from deps; unpinned versions
2. Todo 2: version targets not pinned (next@latest could drift)
3. Todo 4: dynamic({ssr:false}) in Server Component page.tsx is invalid in App Router
4. Todo 4: EventBus may import Node's `events` module (unavailable in browser)
5. Execution waves contradict dependency matrix
6. Todo 14/8: VICTORY state not defined in state machine
7. Todo 3: Harness YAML acceptance too weak; schema guidance incomplete
8. F4: bun.lockb is outdated; modern Bun uses bun.lock

### Fixes Applied (Round 1 → Round 2):
- Todo 2: Added pinned versions (next@~16.2.11, react@^19.2.0, phaser@^4.2.1, gsap@^3.15.0, motion@^12.42.0); added tailwindcss + @tailwindcss/postcss to devDeps; added explicit scripts block; added --ignore-unmatch to git rm; documented bun.lock (not bun.lockb); added App Router client component pattern notes
- Todo 3: Added REQUIRED HARNESS YAML STRUCTURE section with all mandatory schema fields; improved acceptance criteria with proper validation
- Todo 4: Split into GameShell.tsx ("use client" + dynamic) vs page.tsx (Server Component); EventBus now explicitly uses Phaser.Events.EventEmitter (browser-safe), NOT Node events
- Todo 8: Added VICTORY state to enum (IDLE/PLAYING/GAME_OVER/VICTORY); documented victory event and ordering vs difficulty bump
- Todo 9: Added CRITICAL ordering note — victory check BEFORE difficulty bump in eatCake callback
- Waves: Rewrote wave description to clarify that `Blocked by` field is source of truth; waves are grouping convenience, not override
- F4: Updated to check bun.lock (not bun.lockb) and verify Phaser 4.x + Next.js 16.2.x version fields
