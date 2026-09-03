# 变更记录 009：固定 Cordis 依赖

## 变更前

- 根项目通过 `^4.0.2` 从 npm 获取 `@deepseek-ai/cordis`。
- 上游新版本可能在重新安装时进入项目。

## 本次变更

- 将 `@deepseek-ai/cordis@4.0.2` 复制到 `vendor/cordis`。
- 根项目改用 `file:vendor/cordis`。
- 记录来源、版本、许可证和当前边界。

## 边界

- Cordis 本体已固定在仓库中。
- Cordis 的外部依赖仍由 `package-lock.json` 锁定。
- 后续如需完全离线发布，再评估 vendoring `cosmokit` 等传递依赖。

## 验证

- `npm ci`
- 完整测试
- TypeScript 类型检查
