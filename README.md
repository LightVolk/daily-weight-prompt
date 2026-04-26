# Daily Weight Prompt

Daily Weight Prompt is an Obsidian plugin that asks for your current body weight and saves it into today's daily note frontmatter.

It is designed for people who already use Daily Notes or Periodic Notes and want a fast, low-friction way to record weight as part of their daily workflow.

## Features

- Prompts for your weight automatically after Obsidian finishes loading.
- Adds a command to open the prompt manually at any time.
- Finds or creates today's daily note through the standard Daily Notes integration.
- Saves the value into daily note frontmatter under a configurable property name.
- Accepts integer and decimal input such as `87`, `87.4`, or `87,4`.
- Lets you skip entry for the day and stores `null` in the frontmatter property.
- Can avoid showing the automatic prompt more than once per day.

## Requirements

This plugin depends on the Daily Notes integration used by:

- Obsidian Daily Notes
- Periodic Notes

If that integration is not available, the plugin cannot resolve or create today's daily note.

## How it works

When the plugin runs, it checks whether today's daily note already exists.

- If the note exists, the plugin updates its frontmatter.
- If the note does not exist, the plugin attempts to create it first.
- If you enter a value, that number is written to the configured frontmatter property.
- If you choose to skip, the property is written as `null`.

Example frontmatter:

```yaml
---
weight: 87.4
---
```

## Settings

The plugin currently exposes two settings:

- `Weight property name`: the frontmatter property to update. Default: `weight`
- `Ask only once per day`: prevents the automatic startup prompt from appearing again on the same day

## Command

- `Ask current weight now`: opens the weight prompt manually

## Installation for development

1. Clone this repository into your vault plugins folder:
   `VaultFolder/.obsidian/plugins/daily-weight-prompt/`
2. Install dependencies:
   `npm install`
3. Start the development build:
   `npm run dev`
4. Reload Obsidian and enable the plugin in **Settings -> Community plugins**.

## Build for production

Run:

```bash
npm run build
```

This produces the release artifact `main.js` at the plugin root.

## Manual installation

Copy these files into:

`VaultFolder/.obsidian/plugins/daily-weight-prompt/`

- `main.js`
- `manifest.json`
- `styles.css`

Then reload Obsidian and enable the plugin in **Settings -> Community plugins**.

## Project structure

```text
src/
  main.ts                    Plugin lifecycle, command registration, startup flow
  settings.ts                Settings schema and settings tab
  daily-note.ts              Daily note lookup and creation
  ui/weight-prompt-modal.ts  Prompt modal and input validation
```

## Release notes

When publishing a release:

1. Update `manifest.json` with the new plugin version.
2. Update `versions.json` with the minimum supported Obsidian version for that release.
3. Create a GitHub release tag that exactly matches the plugin version, without a leading `v`.
4. Attach `manifest.json`, `main.js`, and `styles.css` as release assets.

## Privacy

This plugin works locally inside your vault.

- No network requests
- No telemetry
- No external services

## Development

- Node.js 18+ recommended
- Package manager: `npm`
- Bundler: `esbuild`

Useful commands:

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
npm run test:watch
```

## Testing

The project includes unit tests for:

- weight input parsing
- daily note lookup and creation flow
- plugin startup, manual command, save, skip, and error handling behavior

Run the full test suite once:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

## License

0BSD
