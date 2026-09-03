# 变更记录 012：Loader 与配置 Schema

## 变更前

- DSH 包已固定，但项目只直接调用 `Context.plugin(HarnessPlugin)`。
- 没有配置校验和明确的 Loader 启动顺序。

## 本次目标

- 使用 Schemastery 校验可持久化 Harness 配置。
- 由 Bootstrap 先启动 Loader，再启动 Harness Plugin。
- 配置失败时不发布 Harness 服务。

## 验证

- 合法配置可启动 Loader 和 Harness 服务。
- 非法配置在启动前失败。
- Context dispose 可回收整棵插件树。

## 后续

- 接入 Include/YAML 文件配置。
- 增加工具注册表和权限策略。
