# ADR-004: Use Vitest with local Obsidian mocks for unit testing

## Status

Accepted

## Context

The plugin imports Obsidian API modules that do not provide a normal runtime entrypoint in Node-based tests.

The project still needs automated tests for core business behavior.

## Decision

Use Vitest for unit tests and provide a local test-only Obsidian runtime mock through `tests/mocks/obsidian.ts` and `vitest.config.ts`.

## Rationale

- Fast feedback loop
- Good TypeScript support
- Easy module mocking
- Allows testing plugin flow without a real Obsidian runtime

## Consequences

Positive:

- Good coverage of business logic
- Repeatable local test runs
- Low maintenance test stack

Negative:

- Rendering and real Obsidian integration still require manual testing
- Test mocks must be kept in sync with runtime usage

## Implementation notes

- Run tests with `npm test`
- Watch mode: `npm run test:watch`
- Keep UI/runtime assumptions minimal inside tests
