# 变更记录 030：分类测试与真实实测记录

## 测试分类

| 类型 | 入口 | 目的 | 外部依赖 |
|------|------|------|------|
| 确定性边界测试 | `npm run test:deterministic` | 验证权限、路径、并发、JSONL、Projection、装配和错误边界 | 无网络、无 API 费用 |
| 后端真实实测 | `npm run test:real` | 验证真实 DeepSeek、真实文件 IO、真实 Agent Loop 和 JSONL | `.env` 中的 DeepSeek 配置 |
| 前端真实用户测试 | 后续 Chrome CDP 测试 | 验证 Web UI、流式输出、审批交互和 Session 展示 | Chrome/CDP、运行中的前端 |

## 本次实测记录

1. 使用项目 `.env` 自动加载 DeepSeek 配置，不输出密钥。
2. 第一次运行因临时 workspace 未创建而失败，错误为 `ENOENT`。
3. 修正测试夹具，创建 workspace 后重新运行。
4. DeepSeek 实际发出 `read_file` Tool Call。
5. ReadonlyFileTool 真实读取临时 `todo.txt`。
6. JsonlSession 真实写入 `session.jsonl`。
7. DeepSeek 生成中文总结，真实链路测试通过。
8. 保留产物目录：`C:\WINDOWS\TEMP\dsh-real-chain-JR2KNw`。

## 验证结果

- `npm run test:deterministic`：17 个测试文件、33 个测试通过 ✅
- `npm run test:real`：1 个真实测试通过 ✅
- `npm run typecheck`：通过 ✅

## 后续

- 继续将需要模型决策的 FakeModel 场景迁移为真实实测或明确标记为边界测试。
- 前端完成后增加 Chrome CDP 自动化测试。
