# ADR-001: Use Daily Notes integration through `obsidian-daily-notes-interface`

## Status

Accepted

## Context

The plugin must resolve or create today's daily note without reimplementing Daily Notes behavior itself.

Different users may use:

- Obsidian Daily Notes
- Periodic Notes

## Decision

Use `obsidian-daily-notes-interface` as the integration layer for daily note lookup and creation.

## Rationale

- Reuses the standard ecosystem integration point
- Avoids duplicating note-path logic
- Keeps the plugin small
- Makes note creation behavior consistent with user Daily Notes configuration

## Consequences

Positive:

- Less custom code
- Better compatibility with common Daily Notes setups

Negative:

- The plugin depends on external integration behavior
- Some failures come from integration state outside this plugin

## Implementation notes

- Main integration logic lives in `src/daily-note.ts`
- Lookup is attempted before creation
- Creation is used as fallback when lookup fails or returns nothing
