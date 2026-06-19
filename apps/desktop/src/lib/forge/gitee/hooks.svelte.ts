import { PROJECTS_SERVICE } from "$lib/project/projectsService";
import { inject } from "@gitbutler/core/context";
import { reactive } from "@gitbutler/shared/reactiveUtils.svelte";
import type { ForgeUserQuery } from "$lib/forge/interface/types";
import type { Reactive } from "@gitbutler/shared/storeUtils";

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
 */
export function useGiteeAccessToken(projectId: Reactive<string>): GiteeAccess {
	const projectsService = inject(PROJECTS_SERVICE);
	const projectQuery = $derived(projectsService.getProject(projectId.current));
	const accessToken = $derived.by((): string | undefined => {
		const project = projectQuery.response;
		if (
			project === undefined ||
			project.preferred_forge_user === null ||
			project.preferred_forge_user.provider !== "gitee"
		) {
			return undefined;
		}
		return undefined;
	});

	return {
		host: reactive(() => undefined),
		accessToken: reactive(() => accessToken),
		isLoading: reactive(() => false),
		error: reactive(() => undefined),
		isError: reactive(() => false),
	};
}
