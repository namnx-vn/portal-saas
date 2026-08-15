# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace. Apps live under `apps/`, and reusable packages live under `packages/`.

- `apps/frontend`: Vite + React + TypeScript client. Source is in `src/`, static assets are in `public/`, and imported image assets are in `src/assets/`.
- `apps/backend`: Express + TypeScript API using Prisma. Source is in `src/`, Prisma schema and migrations are in `prisma/`, and one-off scripts live in `src/scripts/`.
- `packages/shared`: shared TypeScript package for cross-app types or utilities.

Keep modules feature-focused. Backend service logic belongs in `apps/backend/src/services`, infrastructure helpers in `apps/backend/src/lib`, and React UI components in `apps/frontend/src/components`.

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: run frontend and backend dev servers together.
- `pnpm --filter frontend dev`: start only the Vite frontend.
- `pnpm --filter backend dev`: start only the backend with `tsx watch`.
- `pnpm --filter frontend build`: type-check and build the frontend.
- `pnpm --filter frontend lint`: run ESLint for frontend TypeScript/React files.
- `pnpm --filter backend db:seed`: run Prisma seed script.
- `pnpm --filter backend test:jit`: run the backend JIT test script.

## Coding Style & Naming Conventions

Use TypeScript throughout. Prefer named exports for shared utilities and services. React components use PascalCase filenames, such as `LoginButton.tsx`; hooks use camelCase with a `use` prefix.

The backend uses ESM with NodeNext resolution. Relative imports in backend TypeScript must include runtime extensions, for example `import { prisma } from "./lib/prisma.js"`.

Follow the existing ESLint setup in `apps/frontend/eslint.config.js`. Keep functions focused, validate external input at boundaries, and avoid hardcoded secrets.

## Testing Guidelines

Formal test runners are not fully configured. Run available checks before submitting changes:

- `pnpm --filter frontend build`
- `pnpm --filter frontend lint`
- `pnpm --filter backend exec tsc --noEmit`
- `pnpm --filter backend test:jit` when touching backend auth/JIT behavior

Place future tests near the code, using names like `auth.service.test.ts` or `LoginButton.test.tsx`.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching the existing history: `chore: init monorepo structure`. Examples: `feat: add tenant login audit`, `fix: normalize auth callback`.

Pull requests should include a short summary, test results, linked issue when available, and screenshots for visible frontend changes. Note schema, migration, or environment variable changes explicitly.

## Security & Configuration Tips

Store secrets in environment variables, never in source. Review Prisma schema and auth/session changes carefully, especially tenant isolation, token validation, cookies, and audit logging.
