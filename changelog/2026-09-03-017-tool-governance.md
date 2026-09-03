# 变更记录 017：Tool Registry 与 Permission Policy

## 变更前

- Agent Loop 直接按名称查找并执行工具。
- 工具没有统一的权限检查边界。

## 本次目标

- 建立独立 Tool Registry。
- 在工具执行前调用 Permission Policy。
- 权限拒绝作为 Tool Result 返回模型，不执行工具本体。

## 验证

- 已注册工具可执行。
- 未注册工具返回错误结果。
- 被策略拒绝的工具不会执行。

## 后续

- 增加并发门控：只读工具并行，写入/Shell 工具独占。
- 加入 Approval Surface 和 Sandbox Executor。
