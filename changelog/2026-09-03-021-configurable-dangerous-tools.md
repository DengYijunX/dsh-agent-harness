# 变更记录 021：可配置危险工具装配

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, config, security | 🟡 中 | 工具已经具备安全边界，但还不能由 DSH 配置选择性装配 | 增加 `enableWriteFile`、`enableShell` 配置；默认只读，危险工具默认拒绝并支持注入自定义 PermissionPolicy/SandboxExecutor |

## 涉及文件

- Modify: `src/dsh/harness-plugin.ts` — 按配置选择工具并装配沙箱/权限依赖
- Modify: `src/dsh/bootstrap.ts` — 将工具开关纳入 Schema
- Modify: `test/dsh-assembly.test.ts` — 验证选择性装配和默认拒绝策略
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新下一步

## 核心改动

- 未配置时只注册 `read_file`。
- `enableWriteFile` 和 `enableShell` 显式开启后才加入对应工具。
- 未注入 PermissionPolicy 时，危险工具返回 `approval required`，不会执行。
- 可通过插件配置注入真实审批实现和 SandboxExecutor。

## 验证

- 命令: `npm run release:check`
- 结果: 12 个测试文件、24 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 实现交互式 ApprovalSurface 和审批状态持久化。
- 增加 SandboxExecutor 的超时、取消、环境与输出限制测试。
