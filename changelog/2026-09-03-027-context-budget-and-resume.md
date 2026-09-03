# 变更记录 027：Context Budget 与 Session Resume

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, refactor | 🟡 中 | 完整 Session 历史可能超过模型上下文，且恢复行为缺少端到端验证 | 为 ContextProjection 增加消息预算和历史摘要，并验证重新加载 JSONL Session 后继续执行 |

## 涉及文件

- Modify: `src/context/context-projection.ts` — 增加 maxMessages 和 summary
- Modify: `src/core/types.ts` — 支持 system 摘要消息
- Create: `test/resume.test.ts` — 验证跨实例 Session Resume
- Modify: `test/context-projection.test.ts` — 验证预算和摘要
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 更新 Resume 状态

## 核心改动

- Session 仍保存完整事实，不因模型预算而丢失历史。
- Projection 只保留最近消息，并可在前面加入历史摘要。
- 重新创建 JsonlSession 后，Agent Loop 自动读取旧事件并继续生成。

## 验证

- 命令: `npm run release:check`
- 结果: 17 个测试文件、33 个测试通过；类型检查、构建和 npm tarball 预览全部通过 ✅

## 后续

- 增加 token 级预算、摘要生成器和损坏事件恢复策略。
- 进入 SDK / JSON-RPC Surface 与生产级 Rollout 设计。
