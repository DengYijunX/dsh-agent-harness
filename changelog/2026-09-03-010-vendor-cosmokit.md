# 变更记录 010：固定 Cordis 传递依赖

## 变更前

- Cordis 本体已固定在 `vendor/cordis`。
- Cordis 仍通过 semver 从 npm 解析 `@deepseek-ai/cosmokit`。

## 本次变更

- 将 `@deepseek-ai/cosmokit@1.8.3` 固定到 `vendor/cosmokit`。
- 将 Cordis 内部依赖改为 `file:../cosmokit`。
- 更新 vendor 说明，明确来源和版本边界。

## 验证

- `npm ci`
- 完整测试
- TypeScript 类型检查
