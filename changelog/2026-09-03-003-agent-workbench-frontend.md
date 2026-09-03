# 变更记录 #003 — 2026-09-03

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| feature, frontend, architecture | 🟡 中 | 当前仓库缺少可独立运行的前端产品原型，任务运行过程没有用户态和开发态的可视化承载 | 新增 React/Vite Web 应用，共享任务状态与运行事件模型，使用 Mock Adapter 模拟真实执行链路 |

## 涉及文件

- Create: `apps/web/package.json` — 独立前端脚本和依赖
- Create: `apps/web/src/runtime/contracts.ts` — Task、RuntimeEvent 和 Adapter 契约
- Create: `apps/web/src/runtime/reducer.ts` — 统一运行状态 reducer
- Create: `apps/web/src/runtime/mockAdapter.ts` — 可取消、按顺序发事件的 Mock Adapter
- Create: `apps/web/src/runtime/*.test.ts` — reducer 和事件适配器测试
- Create: `apps/web/src/App.tsx` — 用户面板与开发面板
- Create: `apps/web/src/styles.css` — 响应式视觉系统和状态动效
- Create: `apps/web/index.html`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/src/main.tsx` — Web 应用入口与构建配置
- Create: `docs/superpowers/specs/2026-09-03-agent-workbench-design.md` — 设计决策与验收标准
- Create: `docs/superpowers/plans/2026-09-03-agent-workbench.md` — 实现计划

## 核心改动

- 新增 `/app` 用户体验：任务输入、Mock 流式输出、状态反馈、历史任务和取消入口。
- 新增 `/dev` 开发体验：运行事件时间线、会话状态和基础运行指标。
- 用户态与开发态共享 reducer 和事件协议，但通过不同页面投影数据；原始运行字段只进入开发视图。
- Mock Adapter 发出 `task.created`、状态变化、输出增量、Tool 生命周期和完成事件，后续可替换为 SSE/WebSocket Adapter。
- 采用深墨蓝、暖灰、铜橙和青绿色的任务工作台视觉方向，支持窄屏、键盘焦点和 reduced motion。

## 验证

- 命令: `npm test -- --run`
- 结果: 2 个测试文件、3 个测试全部通过 ✅
- 命令: `npm run typecheck`
- 结果: TypeScript 检查通过 ✅
- 命令: `npm run build`
- 结果: Vite 生产构建成功，输出 `dist/` ✅

## 后续接入点

将 `MockTaskRuntimeAdapter` 替换为实现同一 `TaskRuntimeAdapter` 接口的真实 API/Event Adapter，并把开发权限从路由层下沉到服务端 payload capability。
