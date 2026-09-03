# Vendored dependencies

This directory contains the runtime copy of `@deepseek-ai/cordis` used by this
project.

## Cordis

- Package: `@deepseek-ai/cordis`
- Version: `4.0.2`
- Source: `https://github.com/deepseek-ai/deepseek-harness`
- License: MIT
- npm integrity: recorded in the original lock entry and preserved by the
  vendored package snapshot.

The root project uses `file:vendor/cordis`, so installation does not resolve a
new Cordis release from the registry. Cordis's external runtime dependencies
remain managed by `package-lock.json` and `npm ci`.

`@deepseek-ai/cosmokit@1.8.3` is vendored alongside Cordis because it is a
runtime dependency of Cordis. Cordis now resolves it through
`file:../cosmokit`.
