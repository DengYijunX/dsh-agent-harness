# Agent Workbench 前端设计

## 目标

建立一个可独立运行的前端原型，完整演示创建任务、流式输出、任务状态变化、取消/重试、历史记录，以及开发者对运行事件的透明观察。

## 设计决策

- 使用 React、Vite、TypeScript；前端与当前 TypeScript runtime 保持同一语言生态。
- 用户面板 `/app` 与开发面板 `/dev` 使用独立路由和布局。
- 两套界面共享规范化的 Task 与 RuntimeEvent、状态 reducer 和 Adapter 接口。
- Mock Adapter 按真实事件顺序异步发出事件，未来只替换 Adapter，不改页面逻辑。
- 用户端只消费语义化状态和最终结果；开发端才消费工具、模型、耗时和原始事件详情。
- 本阶段不接真实后端、不保存服务端数据、不把权限判断交给前端。

## 体验方向

产品主题是“执行中的工作台”：用户界面留白充足，聚焦任务和结果；开发界面采用高密度时间线与事件详情。主色使用深墨蓝 `#16202A`，强调色为铜橙 `#E88952`，背景为暖灰 `#F4F1EA`，成功使用青绿色 `#2E8C7A`，错误使用砖红 `#B85445`。签名元素是贯穿两套界面的“运行脉冲线”：用户端表达进度，开发端表达事件序列。

## 数据流

```text
TaskRuntimeAdapter
  -> RuntimeEvent
  -> runtimeReducer
  -> user selectors / developer selectors
  -> independent page layouts
```

## 验收标准

1. `npm run dev` 可以启动前端。
2. 用户可以输入任务并看到 Mock 流式执行与最终结果。
3. 用户可以取消正在运行的任务并重新执行失败任务。
4. 历史列表能展示本地会话中的任务。
5. `/dev` 能看到同一任务的完整事件时间线和事件详情。
6. reducer 和 Mock Adapter 有自动化测试。
7. 页面在窄屏可用，键盘焦点可见，并尊重 reduced motion。
