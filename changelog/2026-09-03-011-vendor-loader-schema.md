# 变更记录 011：固定 Loader 与配置依赖

## 变更前

- Cordis/Cosmokit 已在仓库内固定。
- Loader、Include 和 Schemastery 仍从 npm 按 semver 解析。

## 本次变更

- 固定 `cordis-plugin-loader@1.0.3`。
- 固定 `cordis-plugin-include@1.0.7`。
- 固定 `schemastery@3.18.2`。
- 将这些包的 Cosmokit 依赖改为仓库内 `file:` 链接。

## 验证

- `npm ci`
- 完整测试
- TypeScript 类型检查
