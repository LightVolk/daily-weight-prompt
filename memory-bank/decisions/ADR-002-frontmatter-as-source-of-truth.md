# ADR-002: Use daily note frontmatter as the source of truth for the current day's weight

## Status

Accepted

## Context

The plugin needs to persist a daily weight value in a way that is visible, portable, and aligned with Obsidian note workflows.

## Decision

Store the daily weight in the current day's note frontmatter under a configurable property name.

If the user skips the entry, store `null` in that property.

## Rationale

- Keeps the data inside the note system
- Makes the value available to Dataview and other frontmatter-aware workflows
- Avoids inventing a second storage system for user data
- Keeps plugin data limited to configuration and bookkeeping

## Consequences

Positive:

- User data stays local and transparent
- Works well with note-based automation

Negative:

- Frontmatter mutation can fail if the file is not writable or malformed
- Skip state is explicit and may not match every user's preference

## Implementation notes

- The write path lives in `src/main.ts`
- The property name comes from plugin settings
- Plugin data stores only:
  - `weightPropertyName`
  - `askOnlyOncePerDay`
  - `lastPromptDate`
