import { isStr } from "@gitbutler/ui/utils/string";
import type { Persisted } from "@gitbutler/shared/persisted";

export enum ModelKind {
	OpenAI = "openai",
	Anthropic = "anthropic",
	Ollama = "ollama",
	LMStudio = "lmstudio",
	OpenRouter = "openrouter",
	DeepSeek = "deepseek",
	TongyiQwen = "tongyiqwen",
	ZhipuGLM = "zhipuglm",
	Kimi = "kimi",
	Doubao = "doubao",
}

// OpenRouter model names follow the `provider/model` format (e.g. `openai/gpt-4.1-mini`)
export type OpenRouterModelName = `${string}/${string}`;

// https://platform.openai.com/docs/models
export enum OpenAIModelName {
	GPT54 = "gpt-5.4",
	GPT54Mini = "gpt-5.4-mini",
	GPT54Nano = "gpt-5.4-nano",
}

// https://docs.anthropic.com/en/docs/about-claude/models/overview
export enum AnthropicModelName {
	Haiku = "claude-haiku-4-5",
	Sonnet = "claude-sonnet-4-6",
	Opus = "claude-opus-4-6",
}

// https://api-docs.deepseek.com
export enum DeepSeekModelName {
	Chat = "deepseek-chat",
	Reasoner = "deepseek-reasoner",
}

// https://help.aliyun.com/zh/model-studio/getting-started/models
export enum TongyiQwenModelName {
	QwenTurbo = "qwen-turbo",
	QwenPlus = "qwen-plus",
	QwenMax = "qwen-max",
}

// https://open.bigmodel.cn/dev/api/normal-model/glm-4
export enum ZhipuGLMModelName {
	GLM4Flash = "glm-4-flash",
	GLM4Plus = "glm-4-plus",
	GLM4 = "glm-4",
}

// https://platform.moonshot.cn/docs/api/chat
export enum KimiModelName {
	MoonshotV18k = "moonshot-v1-8k",
	MoonshotV132k = "moonshot-v1-32k",
}

// https://www.volcengine.com/docs/82379/1099320
export enum DoubaoModelName {
	DoubaoPro32k = "doubao-pro-32k",
	DoubaoLite32k = "doubao-lite-32k",
}

export enum MessageRole {
	System = "system",
	User = "user",
	Assistant = "assistant",
}

export function isMessageRole(role: unknown): role is MessageRole {
	if (!isStr(role)) return false;
	const roles = Object.values(MessageRole);
	return roles.includes(role as MessageRole);
}

export interface PromptMessage {
	content: string;
	role: MessageRole;
}

export type Prompt = PromptMessage[];

export interface AIEvalOptions {
	maxTokens?: number;
	onToken?: (t: string) => void;
}

export interface AIClient {
	evaluate(prompt: Prompt, options?: AIEvalOptions): Promise<string>;

	defaultBranchTemplate: Prompt;
	defaultCommitTemplate: Prompt;
	defaultPRTemplate: Prompt;
}

export type UserPrompt = {
	id: string;
	name: string;
	prompt: Prompt;
};

export interface Prompts {
	defaultPrompt: Prompt;
	userPrompts: Persisted<UserPrompt[]>;
}

export type FileChange = {
	path: string;
	diffs: string[];
};
