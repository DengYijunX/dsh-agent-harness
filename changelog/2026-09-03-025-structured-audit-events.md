# 变更记录 025：结构化工具审计事件

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, security | 🟡 中 | 仅记录 Tool Call/Result 无法区分授权、拒绝、失败和沙箱执行过程 | 增加 AuditEvent/AuditSink，并由 ToolRegistry 发出请求、授权、完成、失败事件；HarnessPlugin 将其写入 Session |

## 涉及文件

- Modify: `src/core/types.ts` — 增加结构化审计事件契约
- Modify: `src/tools/tool-registry.ts` — 发出工具和权限审计事件
- Modify: `src/dsh/harness-plugin.ts` — 将审计写入 Session Event Log
- Modify: `test/tool-registry.test.ts`、`test/dsh-assembly.test.ts` — 验证审计生成和装配
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新阶段状态

## 核心改动

- `tool_requested`、`permission_granted`、`permission_denied`、`tool_completed`、`tool_failed` 统一使用结构化数据。
- AuditSink 是可替换边界，可接 JSONL、OTel 或独立 Rollout。
- Session 继续保存完整事实，Context Projection 后续只选择模型需要的视图。

## 验证

- 命令: `npm run release:check`
- 结果: 15 个测试文件、30 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 实现 Context Projection、Tool Result 截断和 Session Resume。
