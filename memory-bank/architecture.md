# Architecture

## Code map

- `src/main.ts`
  Plugin lifecycle, command registration, startup prompt flow, save flow, user-facing notices.

- `src/settings.ts`
  Settings schema, defaults, and settings tab UI.

- `src/daily-note.ts`
  Daily note lookup and creation via `obsidian-daily-notes-interface`.

- `src/i18n.ts`
  Locale detection and string dictionaries.

- `src/ui/weight-prompt-modal.ts`
  Modal UI, input validation, save/skip actions.

## Startup flow

1. `onload()` loads settings.
2. `onload()` registers the command and settings tab.
3. `onload()` schedules startup behavior through `workspace.onLayoutReady(...)`.
4. `handleStartupPrompt()` checks the once-per-day guard.
5. `askForCurrentWeight(true)` resolves today's note and opens the modal.

Reason:

- `onLayoutReady` avoids doing UI work too early during app startup.

## Manual command flow

Command id: `ask-current-weight`

Flow:

1. User runs the command.
2. Plugin calls `askForCurrentWeight(false)`.
3. Manual invocation bypasses the once-per-day startup guard.
4. The modal opens even if the startup prompt was already handled today.

## Daily note flow

`ensureTodayDailyNoteExists()` in `src/daily-note.ts` does this:

1. Verify that Daily Notes integration is loaded.
2. Try to get today's note from the integration index.
3. If lookup throws, fall back to direct note creation.
4. If lookup returns nothing, create today's note.
5. Return a `TFile` or throw an error.

Reason:

- Different Daily Notes setups can fail during lookup when folders or settings are inconsistent.

## Save and skip flow

The modal delegates persistence to callbacks provided by `main.ts`.

Save path:

1. Parse input
2. Validate number format
3. Write numeric value to frontmatter
4. Update `lastPromptDate`
5. Save plugin settings

Skip path:

1. Write `null` to the configured frontmatter property
2. Update `lastPromptDate`
3. Save plugin settings

Source of truth:

- The current day's value lives in daily note frontmatter.
- Plugin data stores only configuration and prompt bookkeeping.

## Localization flow

`src/i18n.ts` calls `getLanguage()` from Obsidian.

Current rule:

- `ru*` -> Russian
- everything else -> English

Strings currently routed through localization:

- command name
- settings labels and descriptions
- modal title, labels, buttons, validation text
- plugin-generated notices

## Error handling

User-facing failures are converted to `Notice`.

Current plugin-level error points:

- daily note preparation failure
- frontmatter update failure

Logging:

- internal details are written to `console.error` or `console.warn`
- user-facing copy stays short

## Change guidance

If you need to add a new user-facing string:

1. add it to `Localization` in `src/i18n.ts`
2. add both `en` and `ru` translations
3. consume it from the relevant module
4. add or update tests if behavior depends on locale

If you need to change storage format:

1. update ADRs first if the change is architectural
2. adjust `src/main.ts`
3. update tests in `tests/main.test.ts`
4. update `memory-bank/project.md`
