# 变更记录 026：Context Projection

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, refactor | 🟡 中 | Agent Loop 直接把 Session 事件转换为模型消息，审计事件和超长 Tool Result 没有独立边界 | 增加 ContextProjection，将完整事实日志转换为有限模型视图，并由 Loop 使用该服务 |

## 涉及文件

- Create: `src/context/context-projection.ts` — 生成模型可见消息并截断 Tool Result
- Modify: `src/loop/agent-loop.ts` — 使用可替换 ContextProjection
- Create: `test/context-projection.test.ts` — 验证审计过滤和输出截断
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新 Context Projection 状态

## 核心改动

- Session Event Log 继续保留完整审计和工具事实。
- Context Projection 忽略审计事件，只向模型提供对话、Tool Call 和截断后的 Tool Result。
- Projection 可通过 Loop 配置替换，后续可加入摘要、token budget 和任务相关历史筛选。

## 验证

- 命令: `npm run release:check`
- 结果: 16 个测试文件、31 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 增加 token budget、历史摘要和损坏事件恢复策略。
- 补充“重新加载 JSONL Session 后继续执行”的端到端测试。
