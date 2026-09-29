# AGENTS.md

Expo SDK 57 / React Native (New Architecture) / TypeScript strict. Architecture and rationale: README.md.

## Commands

```bash
npx expo install <pkg>   # ALWAYS use for Expo/RN packages (SDK-compatible versions)
npm run check            # gen:assets --check + typecheck + lint + tests — run before declaring done
npm run gen:assets       # after adding/removing files in assets/images or assets/fonts
```

Native folders (`ios/`, `android/`) are generated (CNG). Never edit them. Configure native behavior
in `app.config.ts` and config plugins.

## Conventions

- **Routes** (`src/app/`) are thin: `export { XScreen as default } from '@/features/...'`.
- **MVVM**: `XScreen.tsx` (View, no logic) + `useXViewModel.ts` (ViewModel). Server state goes through
  TanStack Query inside the ViewModel. App-wide state lives in Zustand vanilla stores created in the DI
  container.
- **Data**: repositories (interface + `Impl`) parse responses with zod DTOs, map them to domain entities,
  and throw only `ApiError`. No use-case layer.
- **DI**: wire new repositories and stores in `src/core/di/dependencies.ts`. Access them with
  `useDependencies()`.
- **Boundaries** (lint-enforced): `core/` and `shared/` never import `features/`. Features never import
  `src/app/`.
- **UI**: never hardcode colors or sizes. Use `makeStyles((t) => ...)` and `AppText`. Use
  `start`/`end` instead of `left`/`right` (RTL).
- **Strings**: add every key to both `en.json` and `ar.json`. Keys are type-checked.
- **Logging**: use `logger`, never `console` (lint error).
- **Imports**: `@/` alias for `src/`, `@test/` for `test/`.
- **Tests**: next to the code (`*.test.ts(x)`). Screens use `renderWithProviders(ui, { fakeRepo })`.
  RNTL v14 `render` and `fireEvent` are async, so `await` them.
