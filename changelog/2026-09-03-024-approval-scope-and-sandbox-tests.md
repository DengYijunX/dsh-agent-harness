# 变更记录 024：审批 Scope 与真实沙箱测试

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security | 🟡 中 | 按工具名缓存审批会把授权扩大到不同参数，危险命令还需要真实超时和取消验证 | 按工具名与规范化参数生成审批 scope，并增加 LocalSandboxExecutor 的真实超时/取消测试 |

## 涉及文件

- Modify: `src/security/approval-store.ts` — 支持 scope resolver，默认按工具参数隔离授权
- Modify: `test/approval-store.test.ts`、`test/jsonl-approval-store.test.ts` — 验证 scope 恢复和不同参数重新审批
- Create: `test/local-sandbox.test.ts` — 验证真实子进程超时与取消
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新后续任务

## 核心改动

- 相同工具、相同参数复用审批。
- 不同 Shell 命令或不同写入目标生成不同 scope，必须重新审批。
- 支持自定义 ScopeResolver，未来可以改为项目、目录或会话级授权。
- LocalSandbox 的真实子进程在超时和取消时被终止。

## 验证

- 命令: `npm run release:check`
- 结果: 15 个测试文件、29 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 修正审批和 Sandbox 的资源清理细节，并补充结构化审计事件。
- 进入 Session Context Projection 与 Resume 完整链路。
