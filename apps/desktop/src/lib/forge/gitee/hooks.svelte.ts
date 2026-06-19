import { PROJECTS_SERVICE } from "$lib/project/projectsService";
import { inject } from "@gitbutler/core/context";
import { reactive } from "@gitbutler/shared/reactiveUtils.svelte";
import type { ForgeUserQuery } from "$lib/forge/interface/types";
import type { Reactive } from "@gitbutler/shared/storeUtils";
import { GITEE_USER_SERVICE, type GiteeAccountIdentifier } from "$lib/forge/gitee/giteeUserService.svelte";

type GiteeAccess = {
	host: Reactive<string | undefined>;
	accessToken: Reactive<string | undefined>;
	isLoading: Reactive<boolean>;
	error: Reactive<{ code: string; message: string } | undefined>;
	isError: Reactive<boolean>;
};

/**
 * Resolve the project's preferred Gitee account and fetch it as a
 * display-ready `ForgeUser`. `user` is `undefined` when no Gitee
 * account is configured.
 */
export function useGiteeForgeUser(projectId: Reactive<string>): ForgeUserQuery {
	const projectsService = inject(PROJECTS_SERVICE);
	const projectQuery = $derived(projectsService.getProject(projectId.current));
	const user = $derived.by((): { login: string; name: string; srcUrl: string } | undefined => {
		const project = projectQuery.response;
		if (
			project === undefined ||
			project.preferred_forge_user === null ||
			project.preferred_forge_user.provider !== "gitee"
		) {
			return undefined;
		}
		const details = project.preferred_forge_user.details;
		return {
			login: details.username ?? details.login,
			name: details.name ?? details.username ?? details.login,
			srcUrl: "",
		};
	});

	return {
		user: reactive(() => user),
		isLoading: reactive(() => false),
	};
}

/**
 * Return the Gitee access token for the given project ID, based on the preferred Gitee username.
 * Uses the giteeUserService to look up the stored token for the project's preferred Gitee account.
 */
export function useGiteeAccessToken(projectId: Reactive<string>): GiteeAccess {
	const projectsService = inject(PROJECTS_SERVICE);
	const giteeUserService = inject(GITEE_USER_SERVICE);
	const projectQuery = $derived(projectsService.getProject(projectId.current));

	// Determine the Gitee username from the project's preferred forge user
	const giteeUsername = $derived.by((): string | undefined => {
		const project = projectQuery.response;
		if (
			project === undefined ||
			project.preferred_forge_user === null ||
			project.preferred_forge_user.provider !== "gitee"
		) {
			return undefined;
		}
		return project.preferred_forge_user.details.username ?? undefined;
	});

	// Build a GiteeAccountIdentifier from the username
	const giteeAccount = $derived.by((): GiteeAccountIdentifier | undefined => {
		if (!giteeUsername) return undefined;
		return {
			type: "patUsername",
			info: { username: giteeUsername },
		};
	});

	// Fetch authenticated user info from backend
	const userQuery = $derived(
		giteeAccount ? giteeUserService.authenticatedUser(giteeAccount) : undefined,
	);

	const accessToken = $derived.by((): string | undefined => {
		const user = userQuery?.result?.data;
		if (!user) return undefined;
		return user.accessToken;
	});

	const isLoading = $derived(userQuery?.result?.isLoading ?? false);
	const isError = $derived(userQuery?.result?.isError ?? false);
	const error = $derived(isError ? { code: "FETCH_ERROR", message: "Failed to fetch Gitee user" } : undefined);

	return {
		host: reactive(() => undefined),
		accessToken: reactive(() => accessToken),
		isLoading: reactive(() => isLoading),
		error: reactive(() => error),
		isError: reactive(() => isError),
	};
}
