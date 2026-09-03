# Release Checklist

## 发布前

1. 更新 `package.json` 版本号。
2. 运行 `npm ci`。
3. 运行 `npm run release:check`。
4. 检查 `npm pack --dry-run` 的文件范围。
5. 提交并推送版本提交与 Git tag。

## 发布检查

```bash
npm run release:check
```

## 发布到 npm

确认 npm 登录状态和包名后，人工执行：

```bash
npm publish --access public
```

当前项目不会在 CI 中自动发布 npm，避免未经确认产生外部发行版本。
