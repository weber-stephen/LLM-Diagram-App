# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16, React, and TypeScript app. Routes and global styles live in `src/app/`; reusable UI lives in `src/components/`, with primitives in `src/components/ui/`. Request handling, validation, rendering adapters, browser storage, and telemetry live in `src/lib/`. Static assets are in `public/` and `src/app/fonts/`; example diagrams are in `diagram_examples/`. Architecture notes are in `docs/`. Logic tests are in `tests/*.test.mjs`, one library test is colocated in `src/lib/`, and browser tests are in `tests/e2e/`.

## Build, Test, and Development Commands

Use Node.js 24 and npm. Run `npm ci` to install from the lockfile, then `npm run dev` for the local server at `http://localhost:3000`. `npm test` runs Node's test runner with the repository's TypeScript loader. `npx tsc --noEmit` checks types; `npm run lint` runs ESLint on `src` and `tests`; `npm run build` creates the production build. After `npx playwright install chromium`, run `npm run test:e2e` against the production build. `npm run quality` runs the full test, type, lint, build, and browser-test sequence.

## Coding Style & Naming Conventions

Follow nearby TypeScript/TSX patterns: two-space indentation, semicolons, and `@/` imports for app code. Use PascalCase for React components (`DiagramRenderer.tsx`) and descriptive kebab-case for library modules (`agent-request.ts`). Keep validation at the request and diagram boundaries; changes to the approval flow must preserve the user's explicit review step. ESLint uses the Next.js Core Web Vitals and TypeScript configurations. No separate formatter is configured.

## Testing Guidelines

Add focused `*.test.mjs` tests for logic changes using `node:test` and `node:assert/strict`. Put browser flows in `tests/e2e/*.spec.ts` with Playwright. Mock OpenAI responses in tests; browser tests should not require a live API key. Run `npm run quality` before opening a pull request. No coverage threshold is configured.

## Commits, Pull Requests & Configuration

Recent commits use short, imperative subjects such as `Add GitHub repository links to app footers`; no Conventional Commits format is established. Keep pull requests focused, describe behavior and verification, and link a relevant issue when one exists. Include screenshots for visible UI changes. The maintainer reviews the diff and requires the `quality` check to pass before merging. Never commit API keys, private prompts, or sensitive diagrams. Optional PostHog settings are documented in `.env.example`; keep local values in `.env.local`.
