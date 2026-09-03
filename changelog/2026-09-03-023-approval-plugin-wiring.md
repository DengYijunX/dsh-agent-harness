# 变更记录 023：审批面与 JSONL 存储接入插件

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security, config | 🟡 中 | 审批回调和持久化存储虽已存在，但 HarnessPlugin 尚未负责组装它们 | 增加 CallbackApprovalSurface、JsonlApprovalStore，并支持通过插件配置注入 ApprovalSurface + ApprovalStore 自动生成 StoredApprovalPolicy |

## 涉及文件

- Create: `src/security/approval-surface.ts` — 提供 CLI/SDK 可注入的回调适配器
- Modify: `src/security/approval-store.ts` — 增加 JSONL 持久化实现
- Modify: `src/dsh/harness-plugin.ts` — 组装审批面和存储策略
- Create: `test/jsonl-approval-store.test.ts` — 验证跨实例恢复
- Modify: `test/dsh-assembly.test.ts` — 验证 Runtime 实际使用审批策略
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新阶段状态

## 核心改动

- 审批状态单独存储，不与 Agent Session Event Log 混用。
- JSONL 存储按工具名读取最新决策，后续可替换为数据库或更细粒度 scope。
- 插件配置显式提供 `approvalSurface` 和 `approvalStore` 后才启用持久化审批；否则危险工具默认拒绝。

## 验证

- 命令: `npm run release:check`
- 结果: 14 个测试文件、27 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 增加审批超时、取消和 scope 化授权。
- 增加真实 LocalSandboxExecutor 的超时与子进程回收测试。
