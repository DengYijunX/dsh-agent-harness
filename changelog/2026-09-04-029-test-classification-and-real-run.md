# 变更记录 029：确定性测试与真实实测分类

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| test, feature | 🟡 中 | 原有测试入口混合了契约边界测试和真实模型链路，容易误解验证结论 | 增加 `test:deterministic`、`test:real`、`test:all` 三个入口；真实测试自动读取 `.env` 并可保留 Session 产物 |

## 测试分类

- 确定性测试：验证路径边界、权限、并发、输出截断、JSONL 格式、插件装配和错误处理，不产生网络费用。
- 真实实测：使用真实 DeepSeek API、真实临时文件、真实 JSONL 和真实 Agent Loop，验证端到端连接。
- Chrome CDP：前端阶段新增浏览器自动化层，验证 Web UI、流式回答、审批交互和 Session 展示。

## 实测过程

1. 第一次真实测试发现临时 workspace 未创建，报 `ENOENT`。
2. 修正测试夹具，创建 workspace 目录。
3. 第二次真实测试成功，耗时约 2.6 秒。
4. DeepSeek 实际产生 `read_file` Tool Call。
5. 真实文件内容进入 Tool Result，最终回答写入 `session.jsonl`。
6. 保留产物目录：`C:\WINDOWS\TEMP\dsh-real-chain-JR2KNw`。

## 验证

- 命令: `npm run test:real -- --reporter=verbose`
- 结果: 真实链路 1 个测试通过 ✅
- 命令: `npm test`
- 结果: 33 个确定性测试通过；无 Key 时真实测试明确 skipped ✅

## 后续

- 逐步替换需要模型决策的 FakeModel 场景。
- 前端阶段增加 Chrome CDP 真实用户链路测试。
