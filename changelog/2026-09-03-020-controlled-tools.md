# 变更记录 020：受控写文件与 Shell 工具

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security | 🟡 中 | Coding Agent 的写入和命令执行能力必须经过工作区、审批、沙箱和并发边界 | 增加受根目录限制的 `write_file`、依赖注入沙箱的 `shell`，并将二者标记为 `exclusive` |

## 涉及文件

- Create: `src/tools/write-file-tool.ts` — 受工作区根目录约束的 UTF-8 写入
- Create: `src/tools/shell-tool.ts` — 通过 SandboxExecutor 执行并截断输出
- Create: `src/security/local-sandbox.ts` — 提供受限 cwd、最小环境变量和取消能力
- Modify: `src/core/types.ts` — 完善工具模式和沙箱接口
- Create: `test/write-file-tool.test.ts`、`test/shell-tool.test.ts` — 工具行为回归
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新阶段状态和后续任务

## 核心改动

- 写文件路径必须位于配置的 workspace root 内，工具本身不负责授权。
- Shell 工具不直接创建进程，所有命令交给可替换的 SandboxExecutor。
- 本地执行器仅作为 MVP 适配器，默认不绕过 ApprovalPolicy 自动开放危险工具。

## 验证

- 命令: `npm run release:check`
- 结果: 12 个测试文件、23 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 将写文件、Shell 和 ApprovalSurface 接入可配置 Harness Plugin。
- 增加审批状态、超时、取消和真实沙箱限制测试。
