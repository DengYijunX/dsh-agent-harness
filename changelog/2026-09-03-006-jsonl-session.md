# 变更记录 006：JSONL Session Store

## 变更前

- Agent Loop 已使用 `MemorySession` 保存事件。
- 进程退出后无法恢复会话。

## 本次目标

- 实现追加式 JSONL Session Store。
- 支持事件追加、完整读取和损坏行定位。
- 保持 `SessionStore` 接口不变，使 Loop 无需知道存储介质。

## 验证

- 事件追加后可按原顺序读取。
- 新实例可从同一文件恢复。
- 损坏 JSONL 行会报告行号。

## 后续

- 将 JSONL Session 接入真实 DeepSeek 端到端链路。
- 增加 snapshot/context projection。
