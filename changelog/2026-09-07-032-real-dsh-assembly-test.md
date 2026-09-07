# 变更记录 032：真实 DSH 装配与测试入口

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| test, integration | 🟡 中 | 真实主链路和治理链路尚未覆盖 DSH Context/Loader/Fiber 的真实启动 | 增加真实 `createHarnessContext()` 集成测试，并将三条真实测试统一纳入 `test:real` |

## 实测过程

1. `createHarnessContext()` 真实启动 Loader、Context 和 Fiber。
2. 注入真实 DeepSeek、JsonlSession 和 ReadonlyFileTool。
3. DeepSeek 实际调用 `read_file` 读取临时文件。
4. Runtime 完成最终回答并写入 JSONL。
5. 测试结束后销毁 Context，清理临时目录。

## 测试入口

- `npm run test:deterministic`：17 个测试文件、33 个测试，不访问网络。
- `npm run test:real`：主链路、治理链路、DSH 装配三条真实测试。
- `npm test` / `npm run test:all`：依次执行以上两类。

## 验证

- 三条真实集成测试：3 个测试通过 ✅
- 确定性测试：33 个测试通过 ✅
- 类型检查和构建：通过 ✅

## 后续

- 继续替换需要模型决策的 FakeModel 场景。
- 前端完成后增加 Chrome CDP 浏览器真实用户测试。
