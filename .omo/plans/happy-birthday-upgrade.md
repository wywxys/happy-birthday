# happy-birthday-upgrade - Work Plan

## TL;DR (For humans)

**What you'll get:** A fully modernized birthday game — the same "云宝" (Yun) character catching cakes concept, but rebuilt from scratch with a proper game engine (Phaser 4), beautiful particle effects, responsive design that works on any screen, a working score system, restart capability, and a polished birthday story intro with smooth animations. Plus a complete Harness CI/CD pipeline plan document.

**Why this approach:** The old code had 24 bugs (memory leaks, broken collision, no restart) and was built on Next.js 12 (end-of-life since 2022). Rather than patch 24 bugs in 137 lines of broken DOM manipulation, we scaffold fresh on Next.js 16 with a real game engine (Phaser) that gives us physics, particles, and sprites out of the box. The game logic becomes ~50 lines of clean Phaser code instead of 137 lines of leaking setIntervals.

**What it will NOT do:**
- No backend, database, or user accounts
- No multiplayer or online leaderboards
- No actual Harness deployment (documentation/YAML only)
- Will NOT remove the original 杉/云 birthday story concept

**Effort:** Large
**Risk:** Medium - Major version jump (12→16) but mitigated by fresh scaffold instead of incremental migration

**Decisions I made for you (veto any here):**
- I treated this as open-ended and chose defaults; if you had a specific outcome in mind, say so and I will switch to asking.
- Fresh scaffold on Next.js 16.2.x App Router (not incremental 12→13→14→15→16 migration)
- TypeScript strict mode (not plain JS)
- Phaser 4 as game engine (not PixiJS, Kaplay, or raw Canvas)
- Framer Motion + GSAP for UI animations
- Tailwind CSS 4 for styling
- bun as package manager (per your request)
- Responsive viewport-relative design (not fixed 500×600px)
- Harness CI/CD plan as YAML + markdown documentation

Your next move: approve this plan to begin execution. The high-accuracy dual review has been completed (Momus + Oracle both initially REJECT'd; all blocking issues have been fixed in this revision). Full execution detail follows below.

---

> TL;DR (machine): Large effort, Medium risk. Deliverables: Next.js 16 App Router + Phaser 4 birthday game (all 24 bugs fixed) + Harness CI/CD plan doc + .gitignore.

## Scope
### Must have
- .gitignore initialization (Node/Next.js/bun/Phaser/IDE)
- Next.js 16.2.x App Router + TypeScript + Tailwind CSS 4 + bun
- Phaser 4 game with Arcade Physics (gravity, collision, score)
- All 24 original bugs eliminated by architecture (not patched)
- Score display, restart button, difficulty progression
- Responsive design (works on mobile 375px → desktop 1920px)
- Enhanced art: parallax sky, particle effects (cake eat sparkles, death feathers, birthday confetti)
- Smooth sprite animations (bird/cloud flap, cake rotation)
- Modernized Intro/Conversation with Framer Motion enter/exit animations
- Birthday finale: animated congratulation text + confetti particles
- Harness CI/CD: .harness/ directory with pipeline YAML + HARNESS.md plan
- Proxy configuration (http://proxy.pek.sap.corp:8080) documented for network-constrained environments

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No backend/API beyond Next.js route handlers
- No database, auth, or user accounts
- No multiplayer or online features
- No paid/copyrighted assets (use existing + CSS/procedural art)
- No Three.js / 3D (overkill)
- No actual Harness account deployment (docs only)
- Must NOT break git history
- Must NOT lose the 杉/云 birthday story or character concept
- Must NOT use npm/pnpm (use bun only)
- Must NOT have direct DOM manipulation for game logic
- Must NOT have setInterval-based game loops (use requestAnimationFrame/Phaser)

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + Phaser scene unit verification via `bun run build` (type-check + bundle) + visual QA via dev server
- Lint: Biome (replaces ESLint, which Next.js 16 dropped `next lint`)
- Type check: `tsc --noEmit` (strict mode)
- Build check: `bun run build` must succeed with zero errors
- Dev smoke: `bun run dev` must start without crashes
- Evidence: .omo/evidence/task-<N>-happy-birthday-upgrade.<ext>

## Execution strategy
### Parallel execution waves
> 6 waves, multi-agent parallel execution within each wave. NOTE: "parallel within a wave" means tasks in that wave that do NOT depend on each other run simultaneously. Tasks with intra-wave dependencies execute sequentially within the wave (respecting the `Blocked by` field). The dependency matrix is the source of truth — wave membership is a grouping convenience, not an override.

**Wave 1: Foundation** — Todos 1, 2, 3 (Todo 1 first; then 2 and 3 in parallel after 1 completes)
**Wave 2: Game Engine Core** — Todo 4, then Todos 5+6 in parallel (both depend on 4)
**Wave 3: Game Features** — Todo 7 (needs 5+6), then Todo 8 (needs 7), then Todo 9 (needs 8) — sequential
**Wave 4: Visual Polish** — Todos 10+11 in parallel (10 needs 9; 11 needs only 4, can start as soon as Wave 2 finishes), then Todo 12 (needs 10+11)
**Wave 5: Conversation & Birthday** — Todo 13 (needs only 2, can start as early as Wave 2), Todo 14 (needs 12+13) — 13 can run parallel with Wave 3/4
**Wave 6: Harness & Final** — Todo 15 (needs 3), Todo 16 (needs 14+15)

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 (.gitignore) | none | 2,3 | — |
| 2 (scaffold Next.js 16) | 1 | 4,5,6,7,8,9,10,11,12,13,14 | 3 |
| 3 (Harness YAML docs) | 1 | 15 | 2 |
| 4 (Phaser setup + bridge) | 2 | 5,6,7,8,9 | — |
| 5 (Bird/Cloud character) | 4 | 7,8 | 6 |
| 6 (Cake obstacle system) | 4 | 7,8 | 5 |
| 7 (Collision + Score) | 5,6 | 8,9 | — |
| 8 (Game states: start/over/restart) | 7 | 9,10 | — |
| 9 (Difficulty progression) | 8 | 10 | — |
| 10 (Particle effects) | 9 | 12 | 11 |
| 11 (Parallax background) | 4 | 12 | 10 |
| 12 (Responsive + mobile) | 10,11 | 14 | — |
| 13 (Conversation UI rewrite) | 2 | 14 | 10,11 |
| 14 (Birthday finale) | 12,13 | 16 | — |
| 15 (Harness HARNESS.md) | 3 | 16 | 13,14 |
| 16 (Final integration + QA) | 14,15 | F1-F4 | — |

## Todos
> Implementation + Test = ONE todo. Never separate.

- [x] 1. `.gitignore`: Initialize comprehensive .gitignore for Next.js 16 + bun + Phaser + IDE
  What to do: Create .gitignore with entries for: node_modules, .next, .bun, out, dist, *.tsbuildinfo, .env*.local, .DS_Store, Thumbs.db, .idea, .vscode (except settings), *.sw?, coverage, .omo/evidence/
  Must NOT do: Do not ignore .harness/ directory, do not ignore public/ assets, do not ignore .omo/plans/ or .omo/drafts/
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2,3
  References: Current .gitignore is empty (0 lines). Standard template: github/gitignore Node.gitignore + Next.js additions.
  Acceptance criteria (cross-platform): `node -e "const l=require('fs').readFileSync('.gitignore','utf8').split('\\n').filter(x=>x.trim()&&!x.startsWith('#')).length; if(l<20){process.exit(1)}"` exits 0; `git status` shows .gitignore as modified; node_modules, .next, .bun entries present; public/ and .harness/ NOT in .gitignore.
  QA scenarios: Happy: .gitignore contains node_modules, .next, .bun entries; public/ and .harness/ are NOT listed. Failure: verify public/ and .harness/ are NOT in .gitignore. Evidence .omo/evidence/task-1-happy-birthday-upgrade.txt
  Commit: Y | chore(repo): initialize comprehensive .gitignore

- [x] 2. Scaffold Next.js 16 App Router project with bun + TypeScript + Tailwind CSS 4
  What to do:
  PRE-FLIGHT: Run `node --version` (must be ≥20.9.0) and `bun --version` (must exist). If Node too old, halt and report.
  SCAFFOLD STRATEGY: Since the directory is non-empty (has .git, public/, .omo/), do NOT run create-next-app in place. Instead:
    (a) Back up assets: copy public/cake.png, cloud.png, shan.png, yun.png, cloud.svg to a temp location
    (b) Use `git rm -r --ignore-unmatch pages/ styles/ next.config.js package-lock.json` (preserves git history; --ignore-unmatch prevents failure if a file is already gone)
    (c) Remove package.json (will be replaced)
    (d) Manually create the Next.js 16 App Router scaffold:
        - package.json with PINNED versions:
          dependencies: { "next": "~16.2.11", "react": "^19.2.0", "react-dom": "^19.2.0", "phaser": "^4.2.1", "gsap": "^3.15.0", "@gsap/react": "^2.1.0", "motion": "^12.42.0" }
          devDependencies: { "@biomejs/biome": "^1.9.0", "@tailwindcss/postcss": "^4.3.0", "tailwindcss": "^4.3.0", "@types/node": "^22.0.0", "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0", "typescript": "^5.6.0", "babel-plugin-react-compiler": "^19.0.0" }
          scripts: { "dev": "next dev --turbopack", "build": "next build", "start": "next start", "typecheck": "tsc --noEmit", "lint": "bunx biome check .", "lint:fix": "bunx biome check --write ." }
        - next.config.ts (ESM default export, with reactCompiler: true)
        - tsconfig.json (strict: true, paths: {"@/*": ["./src/*"]})
        - src/app/layout.tsx (Server Component root layout with metadata, viewport meta, globals.css import)
        - src/app/page.tsx (Server Component that renders a client GameShell component)
        - src/app/globals.css with `@import "tailwindcss";` (Tailwind v4 CSS-native config, NO tailwind.config.js)
        - postcss.config.mjs: `export default { plugins: { "@tailwindcss/postcss": {} } }`
        - biome.json with: recommended rules + noExplicitAny:error + noConsoleLog:warn + indentStyle:space + indentWidth:2
        - .env.example with HTTP_PROXY=http://proxy.pek.sap.corp:8080 documentation
    (e) Restore backed-up assets to public/
    (f) Run `bun install`
    (g) Optimize cloud.png if >100KB: use sharp or manual resize (target: ≤50KB, max 200×150px for sprite use)
  NOTE on Tailwind v4: BOTH `tailwindcss` AND `@tailwindcss/postcss` must be in devDependencies. No tailwind.config.js exists. All config is CSS-native via @theme in globals.css.
  NOTE on React Compiler: Requires `babel-plugin-react-compiler` as dev dep for `reactCompiler: true` to work.
  NOTE on Bun lockfile: Modern Bun (≥1.2) creates `bun.lock` (text-based) by default, not `bun.lockb` (binary). Expect `bun.lock` after install.
  NOTE on App Router + Client Components: src/app/page.tsx is a Server Component. ALL browser-only code (Phaser, game canvas, animations) MUST live in separate "use client" files imported by page.tsx. The dynamic import with ssr:false MUST be inside a "use client" component (e.g., src/components/GameShell.tsx), NOT directly in the server page.
  Must NOT do: Do not delete .git/ directory. Do not use npm/pnpm. Do not use `rm -rf` (use `git rm`). Do not create tailwind.config.js (v4 is CSS-native). Do not run create-next-app interactively. Do not put dynamic({ssr:false}) in a Server Component file. Do not use `next@latest` (pin to ~16.2.11).
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 4,5,6,7,8,9,10,11,12,13,14
  References: Next.js 16 blog (nextjs.org/blog/next-16): requires React 19.2, Node ≥20.9.0, TypeScript ≥5.1. Turbopack is default. `next lint` removed (use Biome). `reactCompiler: true` requires babel-plugin-react-compiler. `next.config.ts` format (ESM default export). Tailwind v4: @import "tailwindcss" in CSS, @tailwindcss/postcss in postcss.config.mjs, both tailwindcss + @tailwindcss/postcss in devDeps. Single-commit repo (hash 0a32ce2) — git history is minimal but preserved via git rm. App Router: page.tsx = Server Component; client code must be in "use client" files. Bun ≥1.2: lockfile is `bun.lock` not `bun.lockb`.
  Acceptance criteria: `node --version` shows ≥20.9.0; `bun run build` succeeds; `bun run dev` starts on localhost:3000; `bun run typecheck` passes; `bun run lint` passes; phaser@4.x + gsap@3.x + motion@12.x in node_modules (verify via `bun pm ls`); old pages/ directory gone from working tree (but in git history via `git log --all -- pages/`); public/ has cake.png, cloud.png, shan.png, yun.png; cloud.png ≤100KB; `bun.lock` exists (NOT bun.lockb); no package-lock.json; `tailwindcss` and `@tailwindcss/postcss` in node_modules.
  QA scenarios: Happy: `bun run dev` shows blank page at localhost:3000; `bun run build` exits 0; `git log --oneline` shows history preserved; `cat bun.lock | head -1` shows lockfile version. Failure: If build fails → check tsconfig paths and next.config.ts syntax; if Tailwind broken → verify both tailwindcss AND @tailwindcss/postcss are in devDeps AND postcss.config.mjs exports the correct plugin name; if "use client" error → ensure dynamic import is in a client component not page.tsx. Evidence .omo/evidence/task-2-happy-birthday-upgrade.txt
  Commit: Y | feat(scaffold): Next.js 16 App Router + TypeScript + Tailwind v4 + Phaser + bun

- [x] 3. Create Harness CI/CD pipeline YAML files in .harness/ directory
  What to do: Create .harness/pipelines/ci-pipeline.yaml (lint→typecheck→build stages as DAG with dependsOn), .harness/pipelines/cd-pipeline.yaml (deploy staging→approval→production), .harness/services/nextjs-service.yaml, .harness/environments/staging.yaml + production.yaml. Use Harness Cloud runners, Cache Intelligence, Build Intelligence. Include bun-specific commands (`bun install`, `bun run build`, `bun run lint`, `bun run typecheck`). Add matrix strategy for Node 20/22. NOTE: Use `bun run typecheck` (tsc --noEmit) as the type-check stage since no test framework is installed yet. Add a comment in the YAML: `# Unit test stage placeholder — add @playwright/test for e2e in future iteration`.
  REQUIRED HARNESS YAML STRUCTURE (must include these fields):
    - Top level: `pipeline.name`, `pipeline.identifier`, `pipeline.orgIdentifier`, `pipeline.projectIdentifier`, `pipeline.stages`
    - Each CI stage: `stage.type: CI`, `stage.spec.cloneCodebase: true`, `stage.spec.platform: { os: Linux, arch: Amd64 }`, `stage.spec.runtime: { type: Cloud, spec: {} }`, `stage.spec.caching: { enabled: true }`, `stage.spec.buildIntelligence: { enabled: true }`, `stage.spec.execution.steps`
    - DAG: stages with `dependsOn` field listing prerequisite stage identifiers
    - Steps: `step.type: Run`, `step.spec.shell: Sh`, `step.spec.command`
  Must NOT do: Do not include real secrets or connector IDs (use placeholders like YOUR_GITHUB_CONNECTOR). Do not require a Harness account to validate. Do not reference `bun test` without a comment noting tests don't exist yet. Do not omit required schema fields (identifier, orgIdentifier, projectIdentifier).
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 15
  References: Harness YAML schema (github.com/harness/harness-schema). Pipeline structure: pipeline > stages > steps. DAG via `dependsOn`. Cache Intelligence: stage.spec.caching.enabled: true. Build Intelligence: stage.spec.buildIntelligence.enabled: true. Required top-level fields: pipeline.identifier, pipeline.name, pipeline.orgIdentifier, pipeline.projectIdentifier. CI stage required fields: type: CI, spec.platform, spec.runtime, spec.cloneCodebase, spec.execution.steps.
  Acceptance criteria: All YAML files are valid YAML (parseable via `node -e "const y=require('fs').readFileSync('.harness/pipelines/ci-pipeline.yaml','utf8'); JSON.stringify(require('js-yaml').load(y))"` after installing js-yaml, OR simply `bun eval "import{load}from'js-yaml';import{readFileSync}from'fs';load(readFileSync('.harness/pipelines/ci-pipeline.yaml','utf8'))"`); pipeline has identifier+name+orgIdentifier+projectIdentifier; each CI stage has type:CI + platform + runtime + caching + buildIntelligence + execution.steps; DAG stages have dependsOn; no `bun test` without placeholder comment.
  QA scenarios: Happy: YAML files parse without error; CI pipeline has lint+typecheck+build stages with correct DAG ordering; each stage has all required Harness schema fields. Failure: YAML indentation error → fix spacing (use 2-space indent throughout); missing schema fields → add identifier/org/project fields. Evidence .omo/evidence/task-3-happy-birthday-upgrade.txt
  Commit: Y | docs(harness): add CI/CD pipeline YAML and environment definitions

- [x] 4. Set up Phaser 4 game canvas with React bridge (EventBus + PhaserGame component)
  What to do: Create src/game/PhaserGame.tsx — a "use client" component that dynamically imports Phaser, creates game instance with Arcade Physics config, attaches to a div ref, handles React StrictMode double-invoke (ref guard), and cleans up on unmount. Create src/game/EventBus.ts — a browser-safe typed event emitter (use Phaser.Events.EventEmitter or a minimal custom implementation — do NOT import Node's `events` module which is unavailable in browser bundles). Events: 'score-update', 'game-over', 'game-start', 'game-state-change', 'victory'. Create src/game/main.ts (Phaser.Types.Core.GameConfig — 800×600 base with Scale.FIT + parent div). Create src/game/scenes/ directory. Create src/components/GameShell.tsx ("use client") that uses next/dynamic with ssr:false to import PhaserGame — this is the component imported by page.tsx. page.tsx (Server Component) renders GameShell without any browser imports.
  Must NOT do: Do not use document.querySelector. Do not use setInterval for game loop. Do not allow Phaser to load during SSR. Do not put dynamic({ssr:false}) directly in page.tsx (it's a Server Component). Do not import Node's `events` module for EventBus (use Phaser.Events.EventEmitter or eventemitter3). Do not use `next/dynamic` in a Server Component.
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 5,6,7,8,9,10,11
  References: phaserjs/template-nextjs (GitHub) — PhaserGame.tsx pattern with useRef guard + EventBus. Phaser.Game config: type: Phaser.AUTO, physics: { default: 'arcade' }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }. App Router pattern: page.tsx (server) → GameShell.tsx ("use client", dynamic import) → PhaserGame.tsx ("use client", Phaser init). EventBus: use `new Phaser.Events.EventEmitter()` exported as singleton — this is browser-safe and has proper TypeScript types.
  Acceptance criteria: `bun run dev` shows Phaser canvas (even if empty/black); No "document is not defined" SSR error; No "module not found: events" bundling error; React DevTools shows GameShell → PhaserGame component tree; console has no errors; Phaser version logged on boot; page.tsx has NO "use client" directive.
  QA scenarios: Happy: Canvas renders at correct aspect ratio, no console errors, page.tsx remains a Server Component. Failure: SSR crash → verify GameShell has "use client" and uses dynamic({ssr:false}); "events" module error → replace Node EventEmitter with Phaser.Events.EventEmitter. Evidence .omo/evidence/task-4-happy-birthday-upgrade.txt
  Commit: Y | feat(game): Phaser 4 canvas setup with React bridge and browser-safe EventBus

- [x] 5. Implement Bird/Cloud character with gravity, jump, and sprite animation
  What to do: Create src/game/scenes/GameScene.ts (extends Phaser.Scene). Load cloud.png as sprite (optimize to ≤50KB / max 200×150px first if not already done in Todo 2). Create player with Arcade physics body: gravity.y = 800, setCollideWorldBounds(true). Jump on pointer-down / spacebar: setVelocityY(-350). Add wing-flap tween (slight rotation oscillation). Clamp to world bounds (top ceiling = bounce, floor collision = game over). Emit "game-over" via EventBus on floor hit.
  NOTE on cloud.png: This asset is the PLAYER CHARACTER sprite (the "cloud" / 云宝). It is NOT the same as cloud.svg which is used for background decoration (Todo 11). If cloud.png is >100KB, it MUST be optimized/resized before use as a Phaser sprite texture (target: ≤50KB, 120×90px max).
  Must NOT do: Do not use setInterval. Do not use document.querySelector. Do not hardcode pixel positions — use Phaser's scale-aware coordinates (this.scale.width/height). Bird must NOT escape canvas bounds. Do not confuse cloud.png (player) with cloud.svg (background decoration).
  Parallelization: Wave 2 | Blocked by: 4 | Blocks: 7,8
  References: Phaser Arcade Physics: this.physics.add.sprite(x, y, 'bird'). Gravity: body.setGravityY(800). Jump: body.setVelocityY(-350). World bounds: setCollideWorldBounds(true). Input: this.input.on('pointerdown', jump). Asset: public/cloud.png (currently 442KB — MUST optimize before sprite use; original CSS showed it at 60×45px display size). cloud.svg = background decoration ONLY.
  Acceptance criteria: Bird appears on screen; falls with gravity; jumps on click/tap/space; cannot fly above canvas top; hits floor → game over event fires; cloud.png texture loaded is ≤100KB.
  QA scenarios: Happy: Click makes bird jump smoothly; gravity pulls back down; floor contact triggers game-over. Failure: Bird clips through floor → check collideWorldBounds; texture loading slow → check file size optimization. Evidence .omo/evidence/task-5-happy-birthday-upgrade.txt
  Commit: Y | feat(game): bird character with physics, jump, and animation

- [x] 6. Implement Cake obstacle spawning and movement system
  What to do: In GameScene, create a Phaser.Physics.Arcade.Group for cakes. Load cake.png as texture. Timer event (this.time.addEvent) spawns cakes every 1500ms from right edge at random Y (within playable bounds, using this.scale.height * 0.2 to this.scale.height * 0.7). Cakes move left at velocity -200. Auto-destroy when off-screen (x < -60). Add slight rotation tween to cakes for visual interest. Difficulty: spawn rate and speed will be adjustable (prep for Todo 9).
  Must NOT do: Do not use setTimeout/setInterval. Do not use DOM createElement. Do not spawn cakes after game over. Cakes must NOT accumulate in memory after leaving screen.
  Parallelization: Wave 2 | Blocked by: 4 | Blocks: 7,8
  References: Phaser Groups: this.physics.add.group(). Timer: this.time.addEvent({ delay: 1500, callback: spawnCake, loop: true }). Velocity: cake.setVelocityX(-200). Off-screen cleanup: cake.on('worldbounds', destroy) or check in update(). Asset: public/cake.png (50×50px).
  Acceptance criteria: Cakes spawn from right at random heights; move left smoothly; disappear when off-screen; memory stable (group.getLength() stays bounded); no cakes spawn after game-over.
  QA scenarios: Happy: Cakes appear every ~1.5s, move left, disappear. Failure: Cakes pile up → check destroy/cleanup logic. Evidence .omo/evidence/task-6-happy-birthday-upgrade.txt
  Commit: Y | feat(game): cake obstacle spawning with physics group and auto-cleanup

- [x] 7. Implement collision detection and score system
  What to do: Use Phaser overlap detection: this.physics.add.overlap(bird, cakeGroup, eatCake). On overlap: destroy cake, increment score, emit "score-update" via EventBus, trigger brief particle burst (prep for Todo 10). Use Phaser overlap (not collider) for "eating" mechanic.
  For "miss" detection (CRITICAL — race condition guard): In update(), iterate cakeGroup.getChildren() and for each cake:
    ```typescript
    if (cake.active && !cake.getData('passed') && cake.x < bird.x - bird.width / 2) {
      cake.setData('passed', true);
      this.gameOver(); // ONLY fires if cake is still active (not already eaten)
    }
    ```
  The `cake.active` check is ESSENTIAL — without it, a cake eaten via overlap in the same frame as it passes bird.x would trigger both "eat" and "miss" simultaneously (race condition).
  Store score in scene property (this.score). Display score in React UI layer (via EventBus).
  Must NOT do: Do not use pixel-range checks (10px window). Use Phaser's built-in AABB overlap which handles all sizes correctly. Do not display score inside Phaser canvas (use React overlay for UI). Do not check miss without `cake.active` guard.
  Parallelization: Wave 3 | Blocked by: 5,6 | Blocks: 8,9
  References: Phaser overlap: this.physics.add.overlap(spriteA, groupB, callback, processCallback, this). Overlap callback receives (bird, cake) args. Score: this.score = 0; this.score++. EventBus.emit('score-update', this.score). Miss detection: cake.active && cake.x < bird.x - bird.width/2 && !cake.getData('passed'). The overlap callback should call cake.destroy() which sets cake.active = false, preventing the miss check from firing on the same cake.
  Acceptance criteria: Bird touching cake = cake disappears + score +1; Cake passing bird without touch = game over; Eating a cake at the exact miss-check boundary does NOT trigger game over (race guard works); Score correctly increments; EventBus emits score to React.
  QA scenarios: Happy: Eat 3 cakes → score shows 3; miss 1 cake → game over; eat cake at last possible moment (bird.x boundary) → no false game-over. Failure: Overlap not detecting → check body sizes and physics config; false game-over on eat → verify cake.active guard. Evidence .omo/evidence/task-7-happy-birthday-upgrade.txt
  Commit: Y | feat(game): AABB collision detection with race-safe miss guard and EventBus score

- [x] 8. Implement game state machine: Start → Playing → GameOver → Victory → Restart
  What to do: Add game states enum: `enum GameState { IDLE, PLAYING, GAME_OVER, VICTORY }`. IDLE: show "点击开始" text in Phaser (or React overlay); bird visible but no gravity; no cakes. PLAYING: gravity active, cakes spawn, score counts. GAME_OVER: freeze physics (this.physics.pause()), stop cake timer, emit "game-over" to EventBus with final score. VICTORY: triggered when score >= 20 (victoryThreshold); freeze physics, stop cake timer, emit "victory" to EventBus with final score and time survived — this is DISTINCT from GAME_OVER and must be checked BEFORE the difficulty bump at score 20. RESTART: this.scene.restart() — resets all scene state cleanly (score, difficulty, state → IDLE). EventBus: emit 'game-state-change' with state. React overlay: show start/gameover/victory screens based on state.
  NOTE: VICTORY state is essential for Todo 14 (birthday finale). The score check in eatCake callback must be: `if (this.score >= this.victoryThreshold) { this.victory(); return; }` BEFORE applying difficulty bump. This prevents a difficulty increase firing at the same frame as victory.
  Must NOT do: Do not use mutable let variables for state (use Phaser scene properties). Do not leave intervals/timers running after game over OR victory. Do not require page reload to restart. Do not forget VICTORY state (Todo 14 depends on it). Do not apply difficulty bump at victoryThreshold score.
  Parallelization: Wave 3 | Blocked by: 7 | Blocks: 9,10
  References: Phaser scene lifecycle: create() → update() loop. Pause physics: this.physics.pause(). Resume: this.physics.resume(). Restart: this.scene.restart(). Timer pause: this.time.removeAllEvents(). State pattern in Phaser: use this.gameState property checked in update(). Victory threshold: this.victoryThreshold = 20 (configurable). EventBus events: 'game-state-change' with { state: GameState, score?: number, time?: number }.
  Acceptance criteria: Game starts on click from IDLE; transitions to GAME_OVER on miss/floor; transitions to VICTORY on score ≥ 20; restart button resets everything cleanly from both GAME_OVER and VICTORY; no memory leaks across 10 restarts; no stale timers; VICTORY and GAME_OVER are distinct events on EventBus.
  QA scenarios: Happy: Start→play→die→restart→play again (score resets); Start→play→score 20→VICTORY event fires (not GAME_OVER). Failure: Score persists after restart → check scene.restart() scope; victory not firing → check score >= threshold before difficulty bump. Evidence .omo/evidence/task-8-happy-birthday-upgrade.txt
  Commit: Y | feat(game): state machine with IDLE/PLAYING/GAME_OVER/VICTORY and clean restart

- [x] 9. Add difficulty progression (speed + spawn rate increase over time)
  What to do: Track score milestones. Every 5 cakes eaten: increase cake velocity by 20 (from -200 base), decrease spawn interval by 100ms (from 1500ms base, minimum 800ms). Cap maximum difficulty. Show brief visual feedback in React UI when difficulty increases (subtle pulse on score, no intrusive "LEVEL UP" flash). Store difficulty params in scene data for restart reset.
  CRITICAL: The difficulty bump check MUST happen AFTER the victory check in the eatCake callback. Order in eatCake: (1) increment score, (2) check score >= victoryThreshold → if yes, call this.victory() and RETURN, (3) THEN check score % 5 === 0 → apply difficulty bump. This prevents a difficulty bump firing at score 20 (the victory threshold) which would be immediately irrelevant.
  NOTE: Difficulty progression is a NEW feature not present in the original game (which had fixed speed/rate). This is adopted as a best-practice default for engaging gameplay.
  Must NOT do: Do not make game impossibly hard (cap at reasonable max: speed -400, delay 800ms). Do not change difficulty mid-cake-flight (only affects new spawns). Do not add intrusive UI elements that distract from gameplay. Do not apply difficulty bump at or above victoryThreshold (check victory FIRST).
  Parallelization: Wave 3 | Blocked by: 8 | Blocks: 10
  References: Phaser timer modify: this.spawnTimer.delay = newDelay. Velocity for new cakes: adjust in spawnCake(). Score milestones: check in eatCake callback AFTER victory check. Difficulty config object: { baseSpeed: 200, baseDelay: 1500, speedIncrement: 20, delayDecrement: 100, maxSpeed: 400, minDelay: 800, victoryThreshold: 20 }. Bumps happen at scores 5, 10, 15 (NOT 20 — that's victory).
  Acceptance criteria: After 5 cakes: speed increases noticeably; after 10: even faster; after 15: max or near-max; score 20 → victory (no difficulty bump at 20); caps at max; restart resets to base difficulty; no UI element blocks game view.
  QA scenarios: Happy: Play long enough to see 3 difficulty bumps (at 5, 10, 15); feel progressively harder but not impossible; score 20 triggers victory not difficulty bump. Failure: Game becomes unplayable → adjust caps; difficulty bump fires at 20 → verify victory check precedes difficulty check in eatCake. Evidence .omo/evidence/task-9-happy-birthday-upgrade.txt
  Commit: Y | feat(game): progressive difficulty with speed and spawn rate scaling

- [x] 10. Add particle effects: cake-eat sparkles, death burst, birthday confetti
  What to do: Create particle configurations using Phaser.GameObjects.Particles.ParticleEmitter. (1) Cake-eat: brief burst of 15-20 golden star particles at cake position, gravity-affected, fade out in 500ms. (2) Death: burst of 30 white/blue feather-like particles from bird position, spread outward. (3) Level-up: brief confetti shower (multi-colored rectangles falling from top). (4) Victory confetti (for birthday finale): sustained confetti emitter for 5 seconds. Use Phaser's built-in particle system (generateTexture for simple shapes if no sprite needed).
  Must NOT do: Do not use DOM elements for particles. Do not leave emitters running indefinitely (set lifespan + stopAfter). Performance: max 200 particles on screen at once.
  Parallelization: Wave 4 | Blocked by: 9 | Blocks: 12
  References: Phaser Particles: this.add.particles(x, y, texture, config). Config: { speed: {min, max}, angle: {min, max}, lifespan: 500, quantity: 20, gravityY: 200, alpha: {start: 1, end: 0}, scale: {start: 0.5, end: 0} }. Generate texture: this.make.graphics().fillCircle(4,4,4).generateTexture('star', 8, 8).
  Acceptance criteria: Eating cake produces visible sparkle burst; dying produces feather burst; level-up shows brief confetti; no particles linger after effect completes; FPS stays >55 during particle effects.
  QA scenarios: Happy: Each effect triggers at correct moment, looks good, cleans up. Failure: FPS drop → reduce particle count. Evidence .omo/evidence/task-10-happy-birthday-upgrade.txt
  Commit: Y | feat(game): particle effects for eat, death, level-up, and confetti

- [x] 11. Create parallax scrolling background with gradient sky and clouds
  What to do: Replace CSS gradient with Phaser rendered background. Layer 0: gradient sky (blue→purple, drawn via Graphics or a pre-rendered texture). Layer 1: distant clouds (slow scroll, 30% speed) — use cloud.svg as decorative cloud texture (NOT cloud.png which is the player character). Layer 2: mid clouds (60% speed). Layer 3: near ground/hills (100% speed). Use Phaser.GameObjects.TileSprite for seamless horizontal scrolling. Generate cloud textures procedurally (Graphics API: ellipses with white/grey) OR use cloud.svg scaled. Ground: gradient brown with grass edge detail.
  NOTE: This todo only depends on Todo 4 (Phaser canvas). It is placed in Wave 4 for depth-ordering reasons — background layers must be finalized after game objects are defined to ensure correct setDepth() values. However, it can be started earlier if Wave 2/3 are complete.
  Must NOT do: Do not use CSS for game background (everything in canvas). Do not make background elements interactive or collidable. Keep parallax subtle (not distracting). Do NOT use cloud.png for background clouds (that is the player character sprite).
  Parallelization: Wave 4 | Blocked by: 4 | Blocks: 12
  References: Phaser TileSprite: this.add.tileSprite(0, 0, width, height, 'clouds').setScrollFactor(0). In update: layer.tilePositionX += speed * delta. Graphics API for procedural textures. Depth sorting: setDepth(0/1/2) for layers. Asset mapping: cloud.png = player character, cloud.svg = background decoration.
  Acceptance criteria: Background scrolls continuously; 3 visible parallax layers at different speeds; looks atmospheric; player and cakes render on top of background (correct depth); no visual tearing at tile seams; cloud.png NOT used as background element.
  QA scenarios: Happy: Smooth parallax visible during gameplay; sky gradient transitions nicely; player renders above background. Failure: Seams visible → check tileSprite wrap settings; wrong depth → adjust setDepth values. Evidence .omo/evidence/task-11-happy-birthday-upgrade.txt
  Commit: Y | feat(game): parallax scrolling background with gradient sky and cloud layers

- [x] 12. Make game fully responsive (mobile + desktop) with Phaser Scale Manager
  What to do: Configure Phaser Scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 800, height: 600 }. This scales the canvas to fit any viewport while maintaining aspect ratio. Use relative coordinates in all game objects (percentage of this.scale.width/height, not absolute pixels). Add touch input support (this.input.on('pointerdown') already works for touch). Add meta viewport tag in layout.tsx. Test at 375×667 (iPhone SE), 390×844 (iPhone 14), 1920×1080 (desktop). Add landscape lock hint (show "rotate device" overlay if width < height on mobile).
  Must NOT do: Do not hardcode any pixel positions (all relative to scale.width/height). Do not break desktop experience for mobile optimization.
  Parallelization: Wave 4 | Blocked by: 10,11 | Blocks: 14
  References: Phaser Scale Manager docs. FIT mode: maintains aspect ratio, adds letterbox. CENTER_BOTH: centers in parent div. Relative positioning: x = this.scale.width * 0.1 (bird at 10% from left). Touch: Phaser handles pointer events uniformly (mouse + touch). Viewport meta: <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">.
  Acceptance criteria: Game playable on 375px wide screen; canvas scales proportionally; no overflow/scroll; touch input works; game fits 1920px desktop without stretching.
  QA scenarios: Happy: Resize browser window → game rescales smoothly; play on simulated mobile → works. Failure: Game overflows → check parent div sizing. Evidence .omo/evidence/task-12-happy-birthday-upgrade.txt
  Commit: Y | feat(game): responsive design with Scale.FIT and touch support

- [x] 13. Rewrite Conversation/Intro UI with Framer Motion animations
  What to do: Create src/components/ConversationOverlay.tsx ("use client"). Port the 10 conversation lines and speaker assignments from Conversation.js. Use Framer Motion AnimatePresence for enter/exit of each dialog bubble. Speaker image: slide in from right with spring animation. Dialog text: fade up with stagger. Skip button: animated hover state. Use motion/react imports (new package name). Store conversation state in React (useState for index). On conversation end: emit 'intro-complete' → show game canvas. Overlay renders on top of game canvas (z-index layer).
  Must NOT do: Do not use CSS animation classes (replace with Framer Motion). Do not block game loading (conversation shows while Phaser loads in background). Do not lose any of the 10 original dialog lines.
  Parallelization: Wave 5 | Blocked by: 2 | Blocks: 14
  References: Original conversation: pages/components/Conversation.js (10 lines of 杉/云 dialog). Speaker images: public/shan.png, public/yun.png. Framer Motion: AnimatePresence + motion.div with initial/animate/exit. Import: `import { motion, AnimatePresence } from 'motion/react'`. Stagger: variants with `transition: { staggerChildren: 0.03 }` for text reveal.
  Acceptance criteria: All 10 dialog lines display in sequence; speaker images animate in/out; skip button works; conversation ends → game becomes playable; animations are smooth (60fps).
  QA scenarios: Happy: Click through all 10 dialogs; animations play correctly; skip jumps to game. Failure: AnimatePresence not triggering exit → check key prop. Evidence .omo/evidence/task-13-happy-birthday-upgrade.txt
  Commit: Y | feat(ui): conversation overlay with Framer Motion animations

- [x] 14. Birthday finale: victory screen with animated birthday message + confetti
  What to do: After player reaches score milestone (e.g., 20 cakes eaten — adjustable, see note): trigger victory state. Show full-screen React overlay with: "云宝生日快乐!" in large animated text (manual character-split into <span> elements + GSAP stagger animation via @gsap/react useGSAP — NOT SplitText plugin which is paid). Pattern:
    ```tsx
    const chars = "云宝生日快乐!".split('')
    // Render: chars.map((c, i) => <span key={i} className="char">{c}</span>)
    // Animate: useGSAP(() => { gsap.from('.char', { opacity:0, y:50, stagger:0.08, ease:'back.out' }) })
    ```
  Birthday cake emoji confetti (Framer Motion staggered drop). Player stats: score, time survived. "再玩一次" (Play Again) button. Trigger Phaser confetti emitter behind the React overlay for layered effect. Background dims (backdrop blur via Tailwind).
  NOTE: Victory at score 20 is a NEW design decision (original game had no victory condition — it was survive-until-miss only). This is adopted as a best-practice default for a birthday game that should have a celebratory ending. Score threshold of 20 ensures the player experiences difficulty progression before winning.
  Must NOT do: Do not use GSAP SplitText plugin (it is a paid Club plugin, NOT free). Use manual character split + gsap.from stagger instead. Do not block restart. Do not lose the celebratory mood of the original "云宝生日快乐捏😘" title.
  Parallelization: Wave 5 | Blocked by: 12,13 | Blocks: 16
  References: Original title: "云宝生日快乐捏😘" (pages/index.js:11). GSAP 3.15.0 free animation: `useGSAP(() => { gsap.from('.char', { opacity:0, y:50, stagger:0.08 }) })` with @gsap/react. Framer Motion (motion/react): motion.div with variants for confetti pieces. Tailwind backdrop: `backdrop-blur-md bg-black/50`. GSAP SplitText is PAID — do NOT use it.
  Acceptance criteria: Reaching score 20 triggers victory; birthday text animates character by character (7 chars staggered); confetti falls; stats shown; restart works from victory screen; celebratory mood achieved; NO SplitText import anywhere in codebase.
  QA scenarios: Happy: Score 20 → victory screen with animations → restart works → score resets. Failure: Victory not triggering → check EventBus score threshold; GSAP error → verify no SplitText import. Evidence .omo/evidence/task-14-happy-birthday-upgrade.txt
  Commit: Y | feat(ui): birthday victory screen with animated text and confetti

- [x] 15. Write HARNESS.md comprehensive deployment plan document
  What to do: Create HARNESS.md at project root — a human-readable deployment plan document covering: (1) Architecture overview (Next.js 16 App Router + Phaser 4 game), (2) Pipeline architecture diagram (ASCII DAG), (3) Environment strategy (staging → production), (4) CI stages explained (lint with Biome, type-check, build, container push), (5) CD stages explained (K8s rolling deploy + rollback), (6) Quality gates (type-check + build + optional Playwright), (7) Feature flag strategy for birthday themes, (8) Monitoring/alerting recommendations, (9) Harness AI and Worker Agents usage recommendations, (10) Connector and secret requirements table. Reference the .harness/ YAML files created in Todo 3.
  Must NOT do: Do not include real secrets. Do not require Harness account to understand the document. Keep it actionable for a team that hasn't used Harness before.
  Parallelization: Wave 6 | Blocked by: 3 | Blocks: 16
  References: .harness/ directory (created in Todo 3). Harness docs: developer.harness.io/docs. Latest features: DAG pipelines, Autonomous Worker Agents (June 2026), Harness AI (AIDA GA), Cache/Build Intelligence. Deployment strategy: rolling with approval gate.
  Acceptance criteria: HARNESS.md is >200 lines; covers all 10 sections listed; references .harness/ YAML files; readable by someone unfamiliar with Harness; valid Markdown.
  QA scenarios: Happy: Read through doc — clear, actionable, complete. Failure: Missing section → add it. Evidence .omo/evidence/task-15-happy-birthday-upgrade.txt
  Commit: Y | docs(harness): comprehensive HARNESS.md deployment plan

- [x] 16. Final integration: wire all components, verify build, clean up
  What to do: Wire everything together in src/app/page.tsx: ConversationOverlay → PhaserGame → ScoreUI → VictoryScreen. Verify: `bun run build` passes, `bun run dev` works end-to-end, all imports resolve, no TypeScript errors, no console errors. Clean up: remove old pages/ directory remnants (if any), remove package-lock.json, remove old styles/ directory, update README.md with new instructions (how to run with bun, game description, tech stack). Run `bunx biome check --write .` for formatting.
  Must NOT do: Do not leave dead code. Do not leave TODO comments (resolve them). Do not leave console.log statements.
  Parallelization: Wave 6 | Blocked by: 14,15 | Blocks: F1-F4
  References: All previous todos' output files. src/app/page.tsx (main entry). package.json scripts. README.md (needs update).
  Acceptance criteria: `bun run build` exits 0; `bun run dev` → full game playable end-to-end; no TypeScript errors; no console errors; `bunx biome check .` passes; README accurate.
  QA scenarios: Happy: Fresh clone → `bun install` → `bun run dev` → play full game loop (intro → game → victory). Failure: Build error → fix imports/types. Evidence .omo/evidence/task-16-happy-birthday-upgrade.txt
  Commit: Y | chore(integration): final wiring, cleanup, and README update

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit — Verify every todo's acceptance criteria was met; all commits exist; .omo/evidence/ files present for each task.
- [x] F2. Code quality review — `bunx biome check .` passes; `tsc --noEmit` passes; no `any` types; no `console.log`; no dead imports; all components have proper types.
- [x] F3. Agent-executed QA — Start `bun run dev`, use Playwright (or agent-browser) to: navigate to localhost:3000, verify canvas element renders, click through conversation overlay (verify 10 dialogs), click to start game, verify score element appears, verify game-over triggers on missed cake, verify restart button works, verify responsive at 375px viewport width. All assertions are automated — no human play-testing required.
- [x] F4. Scope fidelity — Confirm: .gitignore populated (>20 active entries), Next.js 16 (check `node_modules/next/package.json` version field starts with "16.2"), Phaser 4 used (check `node_modules/phaser/package.json` version starts with "4"), all 24 original bugs absent (no setInterval in game code, no document.querySelector, no let game state), Harness docs present (.harness/ + HARNESS.md), bun used (`bun.lock` exists, no package-lock.json), original 杉/云 story preserved (conversation text intact), EventBus uses Phaser.Events.EventEmitter (no Node `events` import).

## Commit strategy
- Atomic commits per todo (16 total commits)
- Conventional commit format: `type(scope): summary`
- Types used: chore, feat, docs
- Branch: `feat/game-modernization` (or directly on main if user prefers)
- Final squash optional (each commit is self-contained and buildable after Wave 1)

## Success criteria
1. `bun install && bun run build` succeeds on a fresh clone with Node ≥20.9.0
2. Game is fully playable: start → eat cakes → score increments → die → restart → victory at score 20
3. Zero of the 24 original bugs are reproducible
4. Game works on mobile (375px) and desktop (1920px) without scroll/overflow
5. Particle effects visible on eat, death, level-up, and victory
6. Parallax background scrolls smoothly
7. Conversation intro plays with smooth animations; skip works
8. Birthday victory message displays with character-by-character animation
9. .harness/ directory contains valid pipeline YAML
10. HARNESS.md is a complete, readable deployment plan
11. .gitignore properly excludes build artifacts and includes source files
12. All TypeScript strict, zero `any`, Biome clean
