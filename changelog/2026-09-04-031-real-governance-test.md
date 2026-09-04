# 变更记录 031：真实工具治理实测

## 概要

| 标签 | 等级 | 根因 | 方案 |
|------|------|------|------|
| test, security | 🟡 中 | FakeModel 只能证明拒绝分支逻辑，不能证明真实模型会触发危险工具且拒绝发生在文件写入之前 | 增加真实 DeepSeek Governance 集成测试，验证真实 write_file Tool Call、PermissionPolicy、WriteFileTool 和 JSONL Session |

## 实测过程

1. 从项目 `.env` 读取 DeepSeek 配置，不输出密钥。
2. 创建真实临时 workspace 和 JSONL Session。
3. 真实 DeepSeek 收到“必须调用 write_file”的 Prompt。
4. 模型实际产生 `write_file` Tool Call。
5. PermissionPolicy 返回 `approval required`。
6. WriteFileTool 未执行，目标文件不存在。
7. 拒绝结果和审计事件写入真实 JSONL Session。

## 测试分类修正

- 初版 `test:deterministic` 只排除主链路，误包含治理实测。
- 已修正为同时排除 `real-chain.integration.test.ts` 和 `real-governance.integration.test.ts`。
- `npm test` 现在依次执行确定性、真实主链路、真实治理链路。

## 验证

- `npm run test:deterministic`：17 个测试文件、33 个测试通过 ✅
- `npm run test:real`：1 个真实链路测试通过 ✅
- `npm run test:real:governance`：1 个真实治理测试通过 ✅
- `npm run typecheck`、`npm run build`：通过 ✅

## 后续

- 继续把需要模型决策的 FakeModel 场景迁移为真实实测。
- 前端完成后增加 Chrome CDP 真实用户链路测试。
