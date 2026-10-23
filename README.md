# dsh-default-chinese（默认中文回复）

让 DeepSeek Harness 的**所有回复默认使用简体中文**的插件。它向系统提示词注入一个全局
「回复语言」段，对主会话、子代理（subagent）、团队成员（teammate）和工作流子代理全部生效。

Make Chinese the default reply language for every DeepSeek Harness response, by
injecting one global system-prompt section that applies to every agent.

## 效果

- 所有面向用户的回复默认使用简体中文：对话正文、分析、总结、提问、错误说明等。
- 代码、命令、路径、标识符、API 名、报错原文、引用文本保持原语言不翻译。
- 仅当用户明确要求其他语言时才切换；被指定语言的产出物（如英文文档）按要求书写。

## 安装

作为 bundle 安装到目标 profile（例如 `desktop`）：

```powershell
# 由 plugin manager 以本地 file: 规格安装
dsh-default-chinese  # 目标：file:<本目录绝对路径>
```

安装后 `package.json` 的 `dsh.profile.bundles` 会出现 `dsh-default-chinese`，
其 `cordis.patch.yml` 把插件条目插入 Loader 树，`patchReload: "live"` 时立即生效，
无需重启。

## 配置（可选）

在 profile 的 `cordis.patch.yml` 中按 id 覆盖：

```yaml
- id: dsh-default-chinese
  name: "dsh-default-chinese"
  config:
    enabled: true          # false 关闭插件
    order: 1               # 提示词段顺序（默认 1，紧随 persona 前缀 0）
    instruction: |         # 完全自定义指令文本（默认内置中文指令）
      ## 回复语言
      所有回复默认使用简体中文。
```

| 字段 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 是否启用插件 |
| `order` | `1` | 系统提示词段顺序值，须为有限数 |
| `instruction` | 内置中文指令 | 完整替换注入的指令文本 |

## 实现

`lib/index.js` 导出 Cordis 插件入口（`name` + `apply(ctx, config)`），通过
`ctx.inject(['systemPrompt'], …)` 在系统提示词注册表注册一个
`reply-language:default-chinese` 段（`order: 1`，`interpolate: false`），
在每次模型步骤前的提示词组装中生效；插件卸载时该段随之释放。
