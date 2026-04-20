# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code for a Vue 3 + TypeScript Vite app. Use `src/pages/` for routed screens, `src/components/` for reusable UI, `src/stores/` for Pinia state, `src/router/` for navigation, `src/utils/` for scoring and matching logic, and `src/types/` for shared types. Structured quiz and character data lives in `src/data/`, with per-character JSON files under `src/data/characters/`. Static images are served from `public/people/`. `scripts/` holds maintenance utilities, `docs/` holds reference material, and `dist/` is build output and should not be edited manually.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server for local work.
- `npm run build`: run `vue-tsc --noEmit` and produce a production bundle in `dist/`.
- `npm run preview`: serve the built app locally for a final check.
- `npm run validate`: validate JSON data consistency in `src/data/`.
- `npm run init:characters`: scaffold character JSON records.
- `npm run sync:assets`: sync character portraits into `public/people/`.

## Coding Style & Naming Conventions
Follow the existing code style: 2-space indentation, semicolon-free TypeScript, and `script setup` for Vue SFCs. Use PascalCase for Vue components (`QuestionCard.vue`), camelCase for functions and store members (`answerCurrent`), and kebab-case for JSON filenames (`mr-qi.json`). Prefer the `@/` alias for imports from `src/`. Keep utility code pure where possible and keep store actions focused on state transitions.

## Testing Guidelines
There is no dedicated test runner configured yet. For now, treat `npm run build` and `npm run validate` as the minimum quality gate before opening a PR. When changing scoring, matching, or data-loading logic, add or update representative fixtures in `src/data/` and verify the affected flow manually in `npm run dev`.

## Commit & Pull Request Guidelines
Recent history includes mixed English/Chinese subjects and temporary commits such as `backup_temp`; avoid that pattern going forward. Write short, imperative commit messages that describe the user-visible or structural change, for example `Add romance result card filtering`. Keep unrelated edits out of the same commit. PRs should include a concise summary, note any data files or scripts touched, link the issue when applicable, and attach screenshots for UI changes.

## Data & Asset Notes
Character content and portraits are tightly paired. If you add or rename a character, update both `src/data/characters/` and `public/people/`, then run `npm run validate` and `npm run sync:assets` before merging.
