# Project

## Summary

`daily-weight-prompt` is an Obsidian community plugin that prompts the user for their current body weight and stores the result in today's daily note frontmatter.

The plugin is designed for low-friction daily use:

- prompt on startup
- manual command fallback
- automatic daily note lookup or creation
- frontmatter persistence
- RU/EN UI localization

## Core user workflow

1. Obsidian loads the plugin.
2. After layout is ready, the plugin decides whether to show the automatic prompt.
3. The plugin resolves today's daily note through the Daily Notes integration.
4. The user enters a weight or skips.
5. The plugin writes the value to frontmatter and stores the last prompt date in plugin data.

## Current feature set

- Startup prompt after `onLayoutReady`
- Manual command: `ask-current-weight`
- Daily note lookup and creation through `obsidian-daily-notes-interface`
- Configurable frontmatter property name
- Once-per-day startup guard
- Decimal parsing with `.` or `,`
- Skip path that stores `null`
- Localization based on Obsidian UI language
- Unit tests for parsing, integration behavior, plugin flow, and localization

## Runtime dependencies

- `obsidian`
- `obsidian-daily-notes-interface`

## Build and tooling

- Package manager: `npm`
- Bundler: `esbuild`
- Language: TypeScript
- Lint: ESLint
- Tests: Vitest

## Release artifacts

- `main.js`
- `manifest.json`
- `styles.css`

## Persistent data

Plugin state is stored in `data.json` through `loadData()` / `saveData()`.

Current settings model:

- `weightPropertyName: string`
- `askOnlyOncePerDay: boolean`
- `lastPromptDate: string`

## Non-goals

- No network calls
- No telemetry
- No syncing to external health services
- No vault-wide scans
- No historical analytics or charting

## Known constraints

- The plugin depends on the Daily Notes integration being available.
- Localization currently supports only Russian and English.
- Some integration error messages originate from the dependency layer and may remain in English unless explicitly wrapped.
- Real UI behavior still needs manual verification inside Obsidian even when unit tests pass.
