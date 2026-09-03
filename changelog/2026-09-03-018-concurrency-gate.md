# 变更记录 018：Tool Concurrency Gate

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, perf | 🟡 中 | Agent Loop 原先按模型事件逐个执行工具，无法利用独立只读工具的并发能力 | 将同一轮 Tool Call 先收集，再按 `executionMode` 分组执行；普通工具并行，`sequential` 工具建立串行屏障 |

## 涉及文件

- Modify: `src/loop/agent-loop.ts` — 增加并发批处理与串行屏障
- Modify: `test/agent-loop.test.ts` — 增加独立工具并行执行回归
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 标记 Concurrency Gate 完成并更新下一步

## 核心改动

- 同一模型响应中的普通工具调用使用 `Promise.all` 并行执行。
- 遇到 `executionMode: 'sequential'` 的工具时，先等待之前的并行批次，再单独执行。
- Tool Result 按 Tool Call 在模型响应中的顺序写入 Session。

## 验证

- 命令: `npm test`
- 结果: 9 个测试文件、19 个测试全部通过 ✅
- 命令: `npm run typecheck; npm run build; git diff --check`
- 结果: 类型检查、构建和 diff 检查全部通过 ✅

## 后续

- 为写文件和 Shell 工具增加 exclusive barrier 语义。
- 增加 Approval Surface 与 Sandbox Executor。
