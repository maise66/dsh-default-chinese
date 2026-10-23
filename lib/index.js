/**
 * dsh-default-chinese host entry.
 *
 * Registers one global system-prompt section that makes Chinese the default
 * reply language for every agent — main sessions, subagents, teammates, and
 * workflow children — because the section is assembled before each model step.
 *
 * Config (all optional, overridable from the profile's cordis.patch.yml):
 * - `enabled`     {boolean}  set `false` to turn the plugin off (default `true`)
 * - `instruction` {string}  replaces the whole default instruction text
 * - `order`       {number}  prompt placement, finite (default `1`, right after
 *                           the deployment persona prefix at `0`)
 */

/** Stable section id: a scoped contribution can shadow it per agent. */
const SECTION_NAME = 'reply-language:default-chinese';

/** Right after the deployment persona prefix (order 0), before first-party guidance. */
const DEFAULT_ORDER = 1;

/** The instruction every model step sees unless `config.instruction` replaces it. */
const DEFAULT_INSTRUCTION = `## 回复语言（Reply Language）

所有面向用户的回复默认使用简体中文，包括对话正文、分析与解释、总结、向用户提问、错误说明、方案与步骤描述、结论等。

仅在以下情况使用其他语言：
- 用户明确要求使用其他语言回复；
- 代码、命令、路径、文件名、标识符、API/字段名、报错原文、引用文本等保持其原始语言，不翻译；
- 产出物被指定使用其他语言（例如要求用英文写的文档、注释、提交信息），按要求的语言书写。

即使用户使用其他语言提问，只要未明确要求更换回复语言，仍默认以中文回复。`;

export const name = 'dsh-default-chinese';

/**
 * Register the default-Chinese reply-language prompt section on the host.
 *
 * @param ctx - Host context that may acquire the systemPrompt service.
 * @param config - Optional profile override from the loader.
 */
export function apply(ctx, config) {
  if (config?.enabled === false) return;

  const order = Number.isFinite(config?.order) ? config.order : DEFAULT_ORDER;
  const instruction = typeof config?.instruction === 'string' && config.instruction.trim() !== ''
    ? config.instruction
    : DEFAULT_INSTRUCTION;

  ctx.inject(['systemPrompt'], (promptCtx) => {
    // Register through the injected scope so unloading this plugin disposes
    // the section again instead of leaving it on the system-prompt layer.
    promptCtx.effect(() => {
      const dispose = promptCtx.systemPrompt.section({
        name: SECTION_NAME,
        order,
        text: instruction,
        interpolate: false,
      });
      return () => dispose();
    }, 'dsh-default-chinese: default Chinese reply language section');
  });
}
