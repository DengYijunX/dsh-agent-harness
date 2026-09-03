# 变更记录 019：Approval 与 Sandbox 契约

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security | 🟡 中 | 危险工具需要在执行前获得明确批准，并需要把进程执行隔离在可替换的沙箱边界内 | 增加 ApprovalSurface、ApprovalPolicy 和 SandboxExecutor 公共契约，同时让 `exclusive` 工具进入串行屏障 |

## 涉及文件

- Modify: `src/core/types.ts` — 增加审批与沙箱抽象，并扩展工具执行模式
- Create: `src/security/approval-policy.ts` — 将 PermissionPolicy 委托给 ApprovalSurface
- Modify: `src/loop/agent-loop.ts` — 支持 `exclusive` 工具
- Modify: `test/agent-loop.test.ts` — 增加 exclusive barrier 回归
- Create: `test/approval-policy.test.ts` — 验证审批决策委托
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新阶段状态和后续任务

## 核心改动

- `ApprovalPolicy` 不直接决定用户是否批准，而是调用可替换的 `ApprovalSurface`。
- `SandboxExecutor` 定义命令执行的最小异步契约，所有调用接收 `AbortSignal`。
- `exclusive` 工具不会与普通并发批次重叠，为写文件和 Shell 工具预留安全边界。

## 验证

- 命令: `npm run release:check`
- 结果: 10 个测试文件、21 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 实现写文件工具和 Shell 工具，并接入真实 Approval Surface。
- 实现可取消、可限制工作区和环境的 Sandbox Executor。
