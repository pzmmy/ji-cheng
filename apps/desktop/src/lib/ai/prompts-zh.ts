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
