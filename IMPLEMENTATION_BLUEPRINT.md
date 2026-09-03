# Harness Runtime Implementation Blueprint

> 这是项目内的活文档。每完成一个阶段、改变一个架构决定、出现或解除阻塞时更新；普通代码细节不单独更新。
commit message格式示例 feat(xx):中文描述

## 宏观目标

构建一个可替换、可恢复、可治理的 Agent Harness：DSH 管理生命周期，Pi 提供模型/Loop 适配，Codex 提供安全与审计设计。

```text
DSH Cordis / Loader
  ↓
Model Adapter
  ↓
Agent Loop
  ↓
Readonly File Tool
  ↓
Memory / JSONL Session
  ↓
CLI / SDK / RPC
```

## 阶段计划

### 阶段一：最小真实链路

1. 定义 `ModelAdapter`、`AgentLoopService`、`AgentTool`、`SessionStore`。
2. 实现 `MemorySession` 和 Fake Model。
3. 用 Fake Model + Memory Session 跑通 Tool Call。
4. 实现 Readonly File Tool，限制工作区路径和输出大小。
5. 接入真实 DeepSeek Model Adapter。
6. 接入 JSONL Session，并完成真实端到端测试。

### 阶段二：可配置与可恢复

加入 DSH Include、Timer、YAML/profile/patch、Session 恢复和启动期配置校验。

### 阶段三：Coding Agent MVP

加入文件修改、Shell、Permission Policy、Approval、Sandbox 和更严格的 Tool Governance。

### 阶段四：生产能力

加入 Rollout/Replay、OTel、Eval、JSON-RPC、多 Agent 和 HMR。

## 当前阶段

阶段一：核心真实链路、DSH Service/Fiber 装配、核心依赖固定、Loader/Schema、Include/YAML 和 CLI 已完成；下一步增加构建与 npm 发布配置。

## 下一步唯一任务

增加构建与发布配置：生成可执行 JavaScript、声明 npm `bin`、限制发布文件，并验证打包后安装。

## 当前不处理

文件写入、Shell、MCP、Sandbox、Approval、Subagent、HMR、TUI 和 Web UI。

## 完成标准

```text
用户输入
→ DeepSeek 模型流
→ Tool Call
→ 只读文件工具
→ Tool Result
→ 模型最终回答
→ Session 保存
→ Agent 正常 dispose
```

## 关键架构决定

- DSH Service/Fiber 拥有生命周期。
- Agent Runtime 拥有 Agent 状态和取消入口。
- Agent Loop 只拥有当前执行，不拥有长期事实记录。
- Session Store 拥有完整事件记录。
- Pi 通过 Adapter 接入，不直接使用完整 `Agent` / `AgentSession`。
- Tool 不自行决定权限；权限检查发生在执行前。
- 所有可取消的异步操作接收 `AbortSignal`。

## 环境变量

真实模型运行时使用环境变量，不把密钥写入仓库：

```text
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_BASE_URL（可选）
```

## 变更记录

| 日期 | 变化 | 原因 |
|---|---|---|
| 2026-09-03 | 创建项目蓝图 | 将宏观计划和小步推进计划绑定到独立项目 |
| 2026-09-03 | 完成 Fake Model、Agent Loop、MemorySession、ReadonlyFileTool 最小链路 | 先验证模块连接和事件契约，再接真实网络模型 |
| 2026-09-03 | 接入 DeepSeek SSE Model Adapter | 将真实模型协议隔离在 `ModelAdapter` 边界内 |
| 2026-09-03 | 接入 JsonlSession | 让事件日志可恢复，并保持 Loop 与存储介质解耦 |
| 2026-09-03 | 完成真实 DeepSeek 端到端 smoke test | 验证模型、工具、事件日志和最终回答可以真实连通 |
| 2026-09-03 | 增加 DSH Cordis Plugin 装配层 | 让核心服务由 Context/Fiber 统一注册和销毁 |
| 2026-09-03 | Vendoring Cordis 与 Cosmokit | 固定 DSH 核心运行时，降低上游预览版变动风险 |
| 2026-09-03 | 增加 Loader/Schema Bootstrap | 固定启动顺序，并在发布 Agent 前完成配置校验 |
| 2026-09-03 | 接入 Include/YAML 配置 | 使用 DSH entry-list 加载插件，并覆盖配置失败回滚 |
| 2026-09-03 | 增加 CLI 启动入口 | 让用户通过 `npm start` 执行一次 Prompt，并自动回收 Context |
