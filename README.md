# DSH Agent Harness

一个基于 DeepSeek Harness（DSH）的模块化 TypeScript Agent Harness。

核心链路：

```text
最小 Harness 骨架
  + 真实 DeepSeek Model
  + 真实 Readonly File Tool
  + Memory / JSONL Session
  + Agent Loop
```

```text
DSH Context / Loader
  → DeepSeek Model Adapter
  → Agent Loop
  → Readonly File Tool
  → JSONL Session
```

当前已完成最小可运行链路、DSH 生命周期装配、YAML 配置、CLI 和 npm tarball 验证。

## 快速开始

要求 Node.js 22 或更高版本。

```bash
git clone https://github.com/DengYijunX/dsh-agent-harness.git
cd dsh-agent-harness
npm ci
```

在 `.env` 中设置 API Key：

```text
DEEPSEEK_API_KEY=your_api_key
```

运行一次 Agent：

```bash
npm start -- --prompt "读取 README.md 并总结项目定位"
```

也可以指定自己的 YAML 配置：

```bash
npm start -- --config custom.yml --prompt "检查项目中的 TODO"
```

## 配置

默认 [harness.yml](harness.yml) 使用 DSH Include entry-list 格式。它加载构建后的 Harness Plugin，并配置模型、会话路径和工作区根目录。

## 开发

```bash
npm test
npm run typecheck
npm run build
npm run release:check
```

## 设计原则

- DSH Cordis/Loader 管理服务装配和生命周期。
- Model、Loop、Tool、Session 保持独立的 TypeScript 接口。
- Tool 不直接决定权限，后续由 Tool Registry/Permission Policy 统一治理。
- JSONL Session 保存事实事件，Context Projection 负责生成模型上下文。
- DSH 核心运行时固定在 `vendor/`，便于审计和复现。

## 参考项目

- `../dsh-source-reference`：Cordis、Loader、插件生命周期和配置装配。
- `../pi`：模型抽象和低层 Agent Loop。
- `../codex-main`：工具治理、权限、安全执行、恢复和审计设计。

## 开发入口

完整的宏观计划和小步任务见 [IMPLEMENTATION_BLUEPRINT.md](IMPLEMENTATION_BLUEPRINT.md)。
