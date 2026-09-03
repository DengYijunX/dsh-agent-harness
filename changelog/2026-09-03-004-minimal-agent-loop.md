# 变更记录 004：最小 Agent Loop 骨架

## 变更前

- 项目已完成 TypeScript/Vitest 初始化。
- 已有端到端意图测试，但 Loop、Model、Session 和 Readonly File Tool 尚未实现。

## 本次变更

- 建立最小公共类型边界。
- 实现 Fake Model、Memory Session、Readonly File Tool。
- 实现一次请求可执行工具并继续生成的 Agent Loop。
- 验证单工具调用、Tool Result 持久化和最终回答。

## 验证

- `npm test -- --run test/agent-loop.test.ts`
- `npm run typecheck`

## 后续

- 增加真实文件系统测试。
- 接入 DeepSeek Model Adapter。
