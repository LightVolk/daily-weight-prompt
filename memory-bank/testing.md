# Testing

## Current test stack

- Vitest
- test-only Obsidian runtime mock in `tests/mocks/obsidian.ts`

## Test files

- `tests/weight-prompt-modal.test.ts`
  Covers parsing rules for weight input.

- `tests/daily-note.test.ts`
  Covers daily note integration behavior and fallback logic.

- `tests/i18n.test.ts`
  Covers locale selection and RU/EN fallback behavior.

- `tests/main.test.ts`
  Covers plugin startup, command registration, modal-opening behavior, save path, skip path, and localized notice behavior.

## What is mocked

- Obsidian runtime imports
- Daily Notes integration module
- modal opening behavior in `main` tests
- `window.moment()`

## What unit tests do not prove

- Actual Obsidian modal rendering
- Real settings tab rendering details
- Real interaction with installed Daily Notes or Periodic Notes plugins
- Real mobile behavior
- Real plugin enable/disable lifecycle inside the app

## When to add tests

Add tests when changing:

- weight parsing
- startup prompt rules
- settings-driven behavior
- localization logic
- daily note lookup/create behavior
- frontmatter write behavior

## Test-writing conventions

- Prefer short, explicit tests over broad integration-style tests.
- Comment only where the scenario or mock setup is not obvious.
- Keep business rules asserted in one place per test.
- If a new feature adds user-visible branching, add at least one positive and one failure-path test.

## Fast test entry points

For plugin flow changes:

- start with `tests/main.test.ts`

For localization changes:

- start with `tests/i18n.test.ts`

For parsing changes:

- start with `tests/weight-prompt-modal.test.ts`

For daily note integration changes:

- start with `tests/daily-note.test.ts`
