import { providesItem, providesList, ReduxTag } from "$lib/state/tags";
import { InjectionToken } from "@gitbutler/core/context";
import type { BackendApi } from "$lib/state/backendApi";
import type { ReactiveQuery } from "$lib/state/butlerModule";
import type { GiteeAccountIdentifier } from "$lib/forge/gitee/giteeUserService.svelte";

// Issue type definitions
export type GiteeIssue = {
	htmlUrl: string;
	number: number;
	title: string;
	state: string;
	body: string | null;
	user: GiteeIssueUser | null;
	labels: GiteeLabel[];
	assignee: GiteeIssueUser | null;
	comments: number;
	createdAt: string | null;
	updatedAt: string | null;
};

export type GiteeIssueUser = {
	id: number;
	login: string;
	name: string | null;
	email: string | null;
	avatarUrl: string | null;
};

export type GiteeLabel = {
	name: string;
};

export const GITEE_ISSUE_SERVICE = new InjectionToken<GiteeIssueService>("GiteeIssueService");

export class GiteeIssueService {
	private backendApi: ReturnType<typeof injectBackendEndpoints>;

	constructor(backendApi: BackendApi) {
		this.backendApi = injectBackendEndpoints(backendApi);
	}

	/** List issues for a repository */
	listIssues(
		params: { owner: string; repo: string; state: string; account?: GiteeAccountIdentifier },
		options?: { transform?: (result: GiteeIssue[]) => GiteeIssue[] },
	): ReactiveQuery<GiteeIssue[]> {
		return this.backendApi.endpoints.listGiteeIssues.useQuery(params, options);
	}

	/** Get a single issue by number */
	getIssue(
		params: { owner: string; repo: string; number: number; account?: GiteeAccountIdentifier },
		options?: { transform?: (result: GiteeIssue | null) => GiteeIssue | null },
	): ReactiveQuery<GiteeIssue | null> {
		return this.backendApi.endpoints.getGiteeIssue.useQuery(params, options);
	}

	/** Create a new issue */
	createIssue() {
		return this.backendApi.endpoints.createGiteeIssue.useMutation();
	}

	/** Update an issue (title, body, state) */
	updateIssue() {
		return this.backendApi.endpoints.updateGiteeIssue.useMutation();
	}
}

function injectBackendEndpoints(api: BackendApi) {
	return api.injectEndpoints({
		endpoints: (build) => ({
			listGiteeIssues: build.query<GiteeIssue[], { owner: string; repo: string; state: string; account?: GiteeAccountIdentifier }>({
				extraOptions: {
					command: "list_gitee_issues",
				},
				query: (args) => args,
				providesTags: (result) =>
					result
						? [...result.map(({ number }) => ({ type: ReduxTag.GiteeIssues, id: number })), providesList(ReduxTag.GiteeIssues)]
						: [providesList(ReduxTag.GiteeIssues)],
			}),
			getGiteeIssue: build.query<GiteeIssue | null, { owner: string; repo: string; number: number; account?: GiteeAccountIdentifier }>({
				extraOptions: {
					command: "get_gitee_issue",
				},
				query: (args) => args,
				providesTags: (_result, _error, { number }) => [
					...providesItem(ReduxTag.GiteeIssues, number),
				],
			}),
			createGiteeIssue: build.mutation<
				GiteeIssue,
				{ owner: string; repo: string; title: string; body: string; account?: GiteeAccountIdentifier }
			>({
				extraOptions: {
					command: "create_gitee_issue",
					actionName: "Create Gitee Issue",
				},
				query: (args) => args,
				invalidatesTags: [providesList(ReduxTag.GiteeIssues)],
			}),
			updateGiteeIssue: build.mutation<
				GiteeIssue,
				{ owner: string; repo: string; number: number; title?: string; body?: string; state?: string; account?: GiteeAccountIdentifier }
			>({
				extraOptions: {
					command: "update_gitee_issue",
					actionName: "Update Gitee Issue",
				},
				query: (args) => args,
				invalidatesTags: (_result, _error, { number }) => [
					...providesItem(ReduxTag.GiteeIssues, number),
					providesList(ReduxTag.GiteeIssues),
				],
			}),
		}),
	});
}
