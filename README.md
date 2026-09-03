# DSH Agent Harness

一个以 TypeScript + DSH Cordis/Loader 为运行时基座的可组合 Agent Harness。

第一条目标链路：

```text
最小 Harness 骨架
  + 真实 DeepSeek Model
  + 真实 Readonly File Tool
  + Memory / JSONL Session
  + Agent Loop
```

## 当前状态

项目初始化阶段。当前只建立工程边界和开发蓝图，尚未实现 Agent Loop、模型适配器或工具。

## 参考项目

- `../dsh-source-reference`：Cordis、Loader、插件生命周期和配置装配。
- `../pi`：模型抽象和低层 Agent Loop。
- `../codex-main`：工具治理、权限、安全执行、恢复和审计设计。

## 开发入口

先阅读 [IMPLEMENTATION_BLUEPRINT.md](IMPLEMENTATION_BLUEPRINT.md)，再按“下一步唯一任务”推进。

## 运行

在 `.env` 中设置 `DEEPSEEK_API_KEY`，然后执行：

```bash
npm ci
npm start -- --prompt "读取 README.md 并用一句话总结项目定位"
```
