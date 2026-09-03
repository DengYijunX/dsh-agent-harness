# 变更记录 028：真实 DeepSeek 链路测试入口

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, test | 🟡 中 | 既有 Loop 测试主要使用 FakeModel，无法证明真实模型、文件工具和 JSONL Session 的连接 | 增加独立真实集成测试，使用 DeepSeek API、真实临时文件和真实 JSONL，并支持保留产物查看事件链 |

## 使用方式

```powershell
$env:DEEPSEEK_API_KEY="你的Key"
$env:KEEP_REAL_CHAIN_ARTIFACTS="1"
npm run test:real -- --reporter=verbose
```

未设置 API Key 时，测试明确 skipped，不伪装成真实通过；设置保留开关后会打印临时目录和完整 Session 事件。

## 涉及文件

- Create: `test/real-chain.integration.test.ts` — DeepSeek + ReadonlyFileTool + JsonlSession + Agent Loop
- Modify: `package.json` — 增加 `test:real` 命令
- Modify: `IMPLEMENTATION_BLUEPRINT.md` — 记录真实链路验收入口

## 验证

- 命令: `npm test; npm run typecheck`
- 结果: 33 个测试通过，真实集成测试因当前环境未配置 API Key 明确 skipped，类型检查通过 ✅

## 后续

- 配置 API Key 后执行真实集成测试，并将其纳入带凭据的 CI 环境。
- 逐步替换需要模型决策的 FakeModel 场景。
