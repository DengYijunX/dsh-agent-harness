# 变更记录 005：DeepSeek Model Adapter

## 变更前

- Agent Loop 已通过 Fake Model 跑通。
- `ModelAdapter` 只有测试实现，尚未连接真实模型协议。

## 本次目标

- 增加基于 DeepSeek OpenAI-compatible Chat Completions SSE 的 Model Adapter。
- 将文本增量、分片 Tool Call 和结束信号转换为 Harness 内部事件。
- 保持 API Key 只从运行时配置读取，不写入仓库。

## 验证

- SSE 文本流解析。
- Tool Call 分片重组。
- HTTP 错误和取消行为。

当前已完成：文本流、Tool Call、HTTP 错误；结束事件已做幂等处理。

补充：移除 Node 原生 strip-only loader 不支持的 TypeScript 参数属性，使源码可直接由 Node 22 启动。

## 后续

- 与真实 DeepSeek API 做手工 smoke test。
- 将 JSONL Session 接入当前 Loop。
