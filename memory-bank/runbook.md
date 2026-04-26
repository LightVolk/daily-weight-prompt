# Runbook

## Environment

- Node.js 18+
- `npm`
- Obsidian vault with the plugin checked out under `.obsidian/plugins/daily-weight-prompt/`

## Install

```bash
npm install
```

## Development

Start watch build:

```bash
npm run dev
```

Reload Obsidian after changes.

## Production build

```bash
npm run build
```

Expected artifact:

- `main.js`

## Lint

```bash
npm run lint
```

## Tests

Run once:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Manual verification

Minimum manual checklist before release:

1. Enable the plugin in Obsidian.
2. Verify the startup prompt appears when expected.
3. Verify the manual command opens the prompt.
4. Enter a valid integer.
5. Enter a valid decimal with `.`.
6. Enter a valid decimal with `,`.
7. Verify invalid input stays in the modal with validation text.
8. Verify skip writes `null`.
9. Verify the configured property name is respected.
10. Verify RU and EN UI behavior by changing Obsidian language.
11. Verify note creation when today's daily note does not yet exist.

## Release workflow

1. Run `npm run lint`
2. Run `npm test`
3. Run `npm run build`
4. Update `manifest.json` version
5. Update `versions.json`
6. Create Git tag equal to the exact plugin version, without `v`
7. Create GitHub release
8. Attach:
   - `manifest.json`
   - `main.js`
   - `styles.css`

## Common failure modes

### The prompt does not appear

Check:

- plugin is enabled
- `askOnlyOncePerDay` is not blocking today
- no startup errors in the console
- Daily Notes integration is available

### Daily note cannot be resolved

Check:

- Daily Notes or Periodic Notes is installed and configured
- today's note template/folder settings are valid
- `obsidian-daily-notes-interface` behavior did not change

### Tests fail on locale behavior

Check:

- `src/i18n.ts`
- `tests/i18n.test.ts`
- `tests/main.test.ts`

### UI text drift

Check:

- new strings were added to both `en` and `ru`
- hardcoded UI strings were not introduced outside `src/i18n.ts`
