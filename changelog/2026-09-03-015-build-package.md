# 变更记录 015：构建与 npm 包元数据

## 变更前

- 项目通过 Node 22 直接运行 TypeScript 源码。
- 没有构建产物、npm `bin` 或可检查的发布包。

## 本次目标

- 将源码编译到 `dist/`。
- 提供 `dsh-agent-harness` 命令。
- 用 `npm pack --dry-run` 验证发布文件边界。

## 验证

- `npm run build`
- `npm pack --dry-run`
- 安装后命令入口和默认 YAML 配置存在。

补充：打包安装验证发现嵌套 `file:` 依赖不会自动成为顶层运行时依赖，已将 vendored Cosmokit 提升为根依赖。

随后又将 `js-yaml` 与 `@standard-schema/spec` 声明为根运行时依赖；全新临时目录安装 tarball 后，`dsh-agent-harness --help` 已验证通过。

## 后续

- 在干净临时目录安装打包产物并运行 `--help`。
- 增加正式版本和发布说明。
