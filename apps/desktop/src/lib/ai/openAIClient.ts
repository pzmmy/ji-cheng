import {
	SHORT_DEFAULT_BRANCH_TEMPLATE,
	SHORT_DEFAULT_COMMIT_TEMPLATE,
	SHORT_DEFAULT_PR_TEMPLATE,
} from "$lib/ai/prompts";
import OpenAI from "openai";
import type {
	OpenAIModelName,
	OpenRouterModelName,
	Prompt,
	AIClient,
	AIEvalOptions,
} from "$lib/ai/types";

const DEFAULT_MAX_TOKENS = 1024;
const AI_REQUEST_TIMEOUT_MS = 60_000; // 60s timeout for AI API calls

export class OpenAIClient implements AIClient {
	defaultCommitTemplate = SHORT_DEFAULT_COMMIT_TEMPLATE;
	defaultBranchTemplate = SHORT_DEFAULT_BRANCH_TEMPLATE;
	defaultPRTemplate = SHORT_DEFAULT_PR_TEMPLATE;

	private client: OpenAI;
	private openAIKey: string;
	private modelName: OpenAIModelName | OpenRouterModelName;

	constructor(
		openAIKey: string,
		modelName: OpenAIModelName | OpenRouterModelName,
		baseURL: string | undefined,
	) {
		this.openAIKey = openAIKey;
		this.modelName = modelName;
		this.client = new OpenAI({ apiKey: openAIKey, dangerouslyAllowBrowser: true, baseURL });
	}

	async evaluate(prompt: Prompt, options?: AIEvalOptions): Promise<string> {
		// Use AbortSignal for request timeout
		const signal = AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS);

		try {
			const response = await this.client.chat.completions.create({
				max_completion_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
				messages: prompt,
				model: this.modelName,
				stream: true,
			}, {
				signal,
			});

			const buffer: string[] = [];
			for await (const chunk of response) {
				const token = chunk.choices[0]?.delta.content ?? "";
				options?.onToken?.(token);
				buffer.push(token);
			}
			return buffer.join("");
		} catch (error) {
			if (error instanceof Error && error.name === "TimeoutError") {
				throw new Error("AI request timed out after 60s. Please try again or use a different model.");
			}
			throw error;
		}
	}
}
