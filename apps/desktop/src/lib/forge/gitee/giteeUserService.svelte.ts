import { providesItem, providesList, ReduxTag } from "$lib/state/tags";
import { InjectionToken } from "@gitbutler/core/context";
import type { BackendApi } from "$lib/state/backendApi";
import type { ReactiveQuery } from "$lib/state/butlerModule";

// Type definitions for Gitee (GiteeAccountIdentifier only has patUsername)

export type GiteeAccountIdentifier = {
	type: "patUsername";
	info: {
		username: string;
	};
};

export type GiteeAuthStatusResponseSensitive = {
	accessToken: string;
	username: string;
	name: string | null;
	email: string | null;
	host: string | null;
};

export type GiteeAuthenticatedUserSensitive = {
	accessToken: string;
	username: string;
	avatarUrl: string | null;
	name: string | null;
	email: string | null;
};

export const GITEE_USER_SERVICE = new InjectionToken<GiteeUserService>("GiteeUserService");

export function isSameGiteeAccountIdentifier(
	a: GiteeAccountIdentifier,
	b: GiteeAccountIdentifier,
): boolean {
	if (a.type !== b.type) {
		return false;
	}
	switch (a.type) {
		case "patUsername":
			return a.info.username === (b as typeof a).info.username;
	}
}

export type GiteeAccountIdentifierType = GiteeAccountIdentifier["type"];

type ExhaustiveGiteeMap = Record<GiteeAccountIdentifierType, true>;

const exhaustiveGiteeMap: ExhaustiveGiteeMap = {
	patUsername: true,
};

function isGiteeAccountIdentifierType(text: unknown): text is GiteeAccountIdentifierType {
	if (typeof text !== "string") {
		return false;
	}
	return exhaustiveGiteeMap[text as GiteeAccountIdentifierType] ?? false;
}

// ASCII Unit Separator, used to separate data units within a record or field.
const UNIT_SEP = "\u001F";

export function giteeAccountIdentifierToString(account: GiteeAccountIdentifier): string {
	switch (account.type) {
		case "patUsername":
			return `${account.type}${UNIT_SEP}${account.info.username}`;
	}
}

export function stringToGiteeAccountIdentifier(str: string): GiteeAccountIdentifier | null {
	const parts = str.split(UNIT_SEP);
	if (parts.length < 2) {
		return null;
	}
	const [type, ...infoParts] = parts;

	if (!isGiteeAccountIdentifierType(type)) {
		return null;
	}

	switch (type) {
		case "patUsername":
			if (infoParts.length < 1) return null;

			return {
				type: "patUsername",
				info: {
					username: infoParts[0]!,
				},
			};
	}
}

export class GiteeUserService {
	private backendApi: ReturnType<typeof injectBackendEndpoints>;

	constructor(backendApi: BackendApi) {
		this.backendApi = injectBackendEndpoints(backendApi);
	}

	get storeGiteePat() {
		return this.backendApi.endpoints.storeGiteePat.useMutation();
	}

	get forgetGiteeAccount() {
		return this.backendApi.endpoints.forgetGiteeAccount.useMutation();
	}

	authenticatedUser<T = GiteeAuthenticatedUserSensitive | null>(
		account: GiteeAccountIdentifier,
		options?: { transform?: (result: GiteeAuthenticatedUserSensitive | null) => T },
	): ReactiveQuery<T> {
		return this.backendApi.endpoints.getGiteeUser.useQuery({ account }, options);
	}

	accounts() {
		return this.backendApi.endpoints.listKnownGiteeAccounts.useQuery();
	}

	deleteAllGiteeAccounts() {
		return this.backendApi.endpoints.clearAllGiteeAccounts.useMutation();
	}
}

function injectBackendEndpoints(api: BackendApi) {
	return api.injectEndpoints({
		endpoints: (build) => ({
			forgetGiteeAccount: build.mutation<void, GiteeAccountIdentifier>({
				extraOptions: {
					command: "forget_gitee_account",
					actionName: "Forget Gitee Username",
				},
				query: (account) => ({
					account,
				}),
				invalidatesTags: [providesList(ReduxTag.GiteeUserList)],
			}),
			getGiteeUser: build.query<
				GiteeAuthenticatedUserSensitive | null,
				{ account: GiteeAccountIdentifier }
			>({
				extraOptions: {
					command: "get_gitee_user",
				},
				query: (args) => args,
				providesTags: (_result, _error, { account }) => [
					...providesItem(ReduxTag.ForgeUser, `gitee:${account.info.username}`),
				],
			}),
			listKnownGiteeAccounts: build.query<GiteeAccountIdentifier[], void>({
				extraOptions: {
					command: "list_known_gitee_accounts",
				},
				query: () => ({}),
				providesTags: [providesList(ReduxTag.GiteeUserList)],
			}),
			clearAllGiteeAccounts: build.mutation<void, void>({
				extraOptions: {
					command: "clear_all_gitee_tokens",
					actionName: "Clear All Gitee Accounts",
				},
				query: () => ({}),
				invalidatesTags: [providesList(ReduxTag.GiteeUserList)],
			}),
			storeGiteePat: build.mutation<GiteeAuthStatusResponseSensitive, { accessToken: string }>({
				extraOptions: {
					command: "store_gitee_pat",
					actionName: "Store Gitee PAT",
				},
				query: (args) => args,
				invalidatesTags: [providesList(ReduxTag.GiteeUserList)],
			}),
		}),
	});
}
