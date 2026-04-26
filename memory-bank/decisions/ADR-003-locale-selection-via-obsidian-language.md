# ADR-003: Use Obsidian `getLanguage()` for locale selection

## Status

Accepted

## Context

The plugin needs localized UI text. The important language is the language configured inside Obsidian, not the OS locale and not browser heuristics.

## Decision

Use `getLanguage()` from the Obsidian API to determine the current app language.

Current mapping:

- `ru*` -> Russian
- all other locales -> English

## Rationale

- Matches the user's active Obsidian UI language
- Avoids guessing through `navigator.language`
- Keeps localization logic deterministic and testable

## Consequences

Positive:

- Predictable behavior
- Easy to extend later

Negative:

- Only RU/EN are currently supported
- Unsupported locales fall back to English

## Implementation notes

- Localization lives in `src/i18n.ts`
- User-facing strings should not be hardcoded in feature modules
