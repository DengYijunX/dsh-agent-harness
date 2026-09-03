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

阶段二已完成：DSH Service/Fiber 装配、核心依赖固定、Loader/Schema、Include/YAML、CLI、可安装 tarball、Tool Registry/Permission Policy、Concurrency Gate、Approval/Sandbox、受控写文件和 Shell、可配置危险工具、审批记忆、JSONL 审批、审批 Scope、真实沙箱测试、结构化审计事件和 Context Projection 均已具备；下一步补齐 Resume 完整性与历史压缩。

## 下一步唯一任务

增加 token budget、历史摘要和损坏事件恢复策略，并补充重新加载 JSONL Session 后继续执行的端到端测试。

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
- Tool Registry 负责查找、权限前置检查、异常归一化，不让具体工具自行决定权限。
- Agent Loop 只依赖 Registry 的执行契约；以后可替换 Registry、Policy 或底层 Loop 实现。
- 同一轮普通 Tool Call 并行执行；`executionMode: 'sequential'` 的工具前后建立串行屏障，结果仍按模型生成顺序写入 Session。

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
| 2026-09-03 | 增加 dist 构建、npm bin 和 tarball 验证 | 验证打包后安装的 CLI 可以正常启动 |
| 2026-09-03 | 增加 Tool Registry 与 Permission Policy | 将工具查找、权限拒绝和执行异常统一放在 Loop 之外，保留后续替换 Registry/Policy 的边界 |
| 2026-09-03 | 增加 Concurrency Gate | 独立只读工具并行执行，顺序敏感工具串行执行，降低延迟并保留安全边界 |
| 2026-09-03 | 增加 Approval/Sandbox 最小契约 | 为危险工具预留可替换的审批和沙箱边界，并让 exclusive 工具进入串行屏障 |
| 2026-09-03 | 增加受控写文件与 Shell 工具 | 将危险能力限制在 workspace、SandboxExecutor 和 exclusive 执行边界内，并保留默认只读启动行为 |
| 2026-09-03 | 增加可配置危险工具装配 | 通过 DSH 配置选择性启用 write_file/shell，默认拒绝危险执行，并保留权限和沙箱注入点 |
| 2026-09-03 | 增加审批记忆与沙箱限制 | 复用审批决策，限制本地命令环境并支持超时和进程取消回收 |
| 2026-09-03 | 接入 ApprovalSurface 与 JSONL 审批存储 | 让 CLI/SDK 可注入审批回调，并让审批决策跨进程实例恢复 |
| 2026-09-03 | 增加审批 Scope 与真实沙箱测试 | 防止授权扩大到不同参数，并验证本地子进程可超时、可取消、可回收 |
| 2026-09-03 | 增加结构化工具审计事件 | 将请求、权限、完成和失败统一记录，为 Session Resume、Rollout 和 OTel 留出观察边界 |
| 2026-09-03 | 增加 Context Projection | 将完整 Session 事实转换为有限模型视图，过滤审计事件并截断 Tool Result |
