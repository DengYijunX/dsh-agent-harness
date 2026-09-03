# 变更记录 007：补齐 Tool Message 协议

## 变更前

- 内部 Tool Call/Tool Result 事件已可持久化。
- 第二次模型请求只带了 Tool Result，缺少 assistant Tool Call 关联信息。

## 本次目标

- 在模型请求中保留 assistant Tool Call。
- 使用 `tool_call_id` 将 Tool Result 关联回对应调用。
- 让真实 DeepSeek Chat Completions 请求符合 OpenAI-compatible 消息协议。

## 验证

- 断言 Loop 第二次请求包含 assistant Tool Call 和 tool message。
- 运行完整测试与类型检查。

真实 smoke test 进一步确认：DeepSeek 要求 assistant Tool Call 显式携带 `type: "function"`；该转换已收敛在 Model Adapter 边界。
