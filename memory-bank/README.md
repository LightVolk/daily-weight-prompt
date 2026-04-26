# Memory Bank

This folder exists to reduce context-rebuild cost for future agents and maintainers.

Read order:

1. `project.md`
2. `architecture.md`
3. `runbook.md`
4. `testing.md`
5. `decisions/`

Use this folder by task:

- Feature work: `project.md`, `architecture.md`, then the relevant ADRs.
- Bug fixing: `architecture.md`, `testing.md`, then `runbook.md`.
- Release work: `runbook.md`, `project.md`.
- Test work: `testing.md`, then `architecture.md`.

Current ADR set:

- `decisions/ADR-001-daily-notes-integration.md`
- `decisions/ADR-002-frontmatter-as-source-of-truth.md`
- `decisions/ADR-003-locale-selection-via-obsidian-language.md`
- `decisions/ADR-004-vitest-with-obsidian-mocks.md`

Scope rules:

- Keep this folder short and factual.
- Update ADRs only when a real architectural decision changes.
- Update `project.md` and `runbook.md` when behavior or workflow changes.
