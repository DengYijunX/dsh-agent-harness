# 变更记录 022：审批记忆与沙箱限制

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security | 🟡 中 | 每次工具调用都重新询问会降低可用性，而本地命令执行还需要超时、环境和取消边界 | 增加 ApprovalStore/MemoryApprovalStore 与 StoredApprovalPolicy；增强 LocalSandboxExecutor 的超时、最小环境和进程回收 |

## 涉及文件

- Modify: `src/core/types.ts` — 增加 ApprovalStore 契约
- Create: `src/security/approval-store.ts` — 提供可替换审批记忆策略
- Modify: `src/security/local-sandbox.ts` — 增加 timeout、环境白名单和 AbortSignal 回收
- Create: `test/approval-store.test.ts` — 验证审批决策复用
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新下一步

## 核心改动

- `StoredApprovalPolicy` 先查询 ApprovalStore，未命中才请求 ApprovalSurface。
- `MemoryApprovalStore` 是当前进程内实现，后续可替换为 JSONL/数据库存储。
- LocalSandbox 只传递最小环境变量，可配置额外白名单变量和超时；取消时杀掉子进程。

## 验证

- 命令: `npm run release:check`
- 结果: 13 个测试文件、25 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 将 StoredApprovalPolicy 接入 Harness Plugin 配置。
- 增加真实超时、取消和子进程回收测试。
