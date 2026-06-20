import { type Prompt, MessageRole } from "$lib/ai/types";

/**
 * Chinese optimized prompt templates for DeepSeek AI.
 * These produce Chinese commit messages and descriptions,
 * while keeping branch names in English (Git standard).
 */

export const SHORT_ZH_COMMIT_TEMPLATE: Prompt = [
	{
		role: MessageRole.User,
		content: `请为我的代码变更写一条 commit message。
仅返回 commit message 本身，不加说明。
说明变更内容和原因，聚焦最重要的变更。
使用现在时，语义化前缀（feat/fix/chore 等）。
每行不超过 72 个字符，标题不超过 50 个字符。
不要在行首使用 # 符号。
%{extra_concise_style}
%{emoji_style}

以下是 git diff：
\`\`\`
%{diff}
\`\`\``,
	},
];

export const LONG_ZH_COMMIT_TEMPLATE: Prompt = [
	{
		role: MessageRole.User,
		content: `请为我的代码变更写一条 commit message。
说明变更内容和原因，聚焦最重要的变更。
使用现在时，语义化前缀（feat/fix/chore 等）。
每行不超过 72 个字符，标题不超过 50 个字符。
仅返回 commit message 本身。

以下是 git diff：
\`\`\`
diff --git a/src/utils/typing.ts b/src/utils/typing.ts
index 1cbfaa2..7aeebcf 100644
--- a/src/utils/typing.ts
+++ b/src/utils/typing.ts
@@ -35,3 +35,10 @@ export function isNonEmptyObject(something: unknown): something is UnknownObject
     (Object.keys(something).length > 0 || Object.getOwnPropertySymbols(something).length > 0)
   );
 }
+
+export function isArrayOf<T>(
+  something: unknown,
+  check: (value: unknown) => value is T
+): value is T[] {
+  return Array.isArray(something) && something.every(check);
+}
\`\`\``,
	},
	{
		role: MessageRole.Assistant,
		content: `feat: 添加 isArrayOf 类型守卫函数

新增泛型类型守卫 isArrayOf，用于检查值是否为指定类型的数组。`,
	},
	...SHORT_ZH_COMMIT_TEMPLATE,
];

export const SHORT_ZH_BRANCH_TEMPLATE: Prompt = [
	{
		role: MessageRole.User,
		content: `请为我的代码变更写一个 Git 分支名。
分支名应简洁描述变更内容，使用英文单词，最多5个词。
用短横线（-）连接单词，不含空格。
仅返回分支名，不加其他内容。

以下是 git diff：
\`\`\`
%{diff}
\`\`\`

以及 commit 信息：
%{commits}`,
	},
];

export const LONG_ZH_BRANCH_TEMPLATE: Prompt = [
	{
		role: MessageRole.User,
		content: `请为我的代码变更写一个 Git 分支名。
分支名应简洁描述变更内容，使用英文单词，最多5个词。
用短横线（-）连接单词，不含空格。
仅返回分支名，不加其他内容。

以下是 git diff：
\`\`\`
diff --git a/src/utils/typing.ts b/src/utils/typing.ts
index 1cbfaa2..7aeebcf 100644
--- a/src/utils/typing.ts
+++ b/src/utils/typing.ts
@@ -35,3 +35,10 @@ export function isNonEmptyObject(something: unknown): something is UnknownObject
     (Object.keys(something).length > 0 || Object.getOwnPropertySymbols(something).length > 0)
   );
 }
+
+export function isArrayOf<T>(
+  something: unknown,
+  check: (value: unknown) => value is T
+): value is T[] {
+  return Array.isArray(something) && something.every(check);
+}
\`\`\``,
	},
	{
		role: MessageRole.Assistant,
		content: `utils-typing-is-array-of-type`,
	},
	...SHORT_ZH_BRANCH_TEMPLATE,
];

export const ZH_PR_SUMMARY_MAIN_DIRECTIVE =
	"列出最重要的变更，使用项目符号，省略其他信息。";

/**
 * AI Code Review prompt template (Chinese).
 * Sends a git diff to the LLM and requests structured review feedback.
 */
export const ZH_AI_REVIEW_PROMPT: Prompt = [
	{
		role: MessageRole.System,
		content: `你是一个资深代码审查专家。请审查以下代码变更（git diff），输出中文评审意见。

严格按以下格式输出，每行一个发现：

如果没有任何问题，只输出一行：✅ 代码质量良好，未发现明显问题。

如果有发现，每条一行，格式：
[严重等级] 文件名:行号 问题描述

严重等级定义：
🔴 P0 — 严重问题：功能错误、安全漏洞、性能退化
🟡 P1 — 一般问题：逻辑不严谨、边界条件遗漏、代码异味
🟢 P2 — 建议：风格优化、可读性改进、最佳实践

示例：
🟡 P1 src/utils/typing.ts:42 isArrayOf 函数缺少空数组的单元测试
🟢 P2 src/utils/typing.ts:10 建议添加 JSDoc 注释说明泛型参数

最后一行空行后输出：---
评审总结：{一句话总结}（高风险/中风险/低风险）`,
	},
	{
		role: MessageRole.User,
		content: `请审查以下代码变更：

\`\`\`diff
%{diff}
\`\`\``,
	},
];

export const ZH_PR_TEMPLATE: Prompt = [
	{
		role: MessageRole.System,
		content: `你是一个代码助手。
请为 Pull Request 写一个中文描述。
使用提供的上下文（COMMIT_MESSAGES、PR_TEMPLATE、TITLE、BODY）。
commit 消息之间用 <###> 分隔。
仅返回描述内容。
如果提供了 PR_TEMPLATE，请用它来格式化描述。`,
	},
	{
		role: MessageRole.User,
		content: `%{pr_main_directive}
%{pr_template_directive}

TITLE:
\`\`\`
%{title}
\`\`\`

BODY:
\`\`\`
%{body}
\`\`\`

COMMIT_MESSAGES:
\`\`\`
%{commit_messages}
\`\`\``,
	},
];
