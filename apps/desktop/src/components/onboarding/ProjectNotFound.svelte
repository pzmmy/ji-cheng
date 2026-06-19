<script lang="ts">
	import { goto } from "$app/navigation";
	import RemoveProjectButton from "$components/projectSettings/RemoveProjectButton.svelte";
	import IllustrationSplitLayout from "$components/shared/IllustrationSplitLayout.svelte";
	import ProjectSwitcher from "$components/shared/ProjectSwitcher.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import notFoundSvg from "$lib/assets/illustrations/not-found.svg?raw";
	import { PROJECTS_SERVICE } from "$lib/project/projectsService";
	import { inject } from "@gitbutler/core/context";
	import { Button, InfoMessage, type MessageStyle, Spacer, TestId } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	interface Props {
		projectId: string;
	}
	const { projectId }: Props = $props();

	const projectsService = inject(PROJECTS_SERVICE);
	const projectQuery = $derived(projectsService.getProject(projectId, true));

	let deleteSucceeded: boolean | undefined = $state(undefined);
	let isDeleting = $state(false);

	async function stopTracking(id: string) {
		isDeleting = true;
		deleteProject: {
			try {
				await projectsService.deleteProject(id);
			} catch {
				deleteSucceeded = false;
				break deleteProject;
			}
			deleteSucceeded = true;
		}
		isDeleting = false;
		goto("/");
	}

	async function locate(id: string) {
		await projectsService.relocateProject(id);
	}

	interface DeletionStatus {
		message: string;
		style: MessageStyle;
	}

	function getDeletionStatus(repoName: string, deleteSucceeded: boolean): DeletionStatus {
		return deleteSucceeded
			? { message: t('onboarding.projectNotFound.deleteSuccess', { repo: repoName }), style: "success" }
			: { message: t('onboarding.projectNotFound.deleteFailed', { repo: repoName }), style: "danger" };
	}
</script>

<IllustrationSplitLayout testId={TestId.ProjectNotFoundPage} img={notFoundSvg}>
	<div class="container">
		<ReduxResult {projectId} result={projectQuery.result}>
			{#snippet children(project)}
				{#if deleteSucceeded === undefined}
					<div class="text-content">
						<h2 class="title-text text-18 text-body text-bold">
							{t('onboarding.projectNotFound.cantFind', { project: project.title })}
						</h2>

						<p class="description-text text-13 text-body">
							{t('onboarding.projectNotFound.description')}
							<br />
							{t('onboarding.projectNotFound.mightBeRemoved')}
							<button type="button" class="check-again-btn" onclick={() => location.reload()}
								>{t('onboarding.projectNotFound.clickHere')}</button
							>
							{t('onboarding.projectNotFound.toCheckAgain')}
							<br />
							{t('onboarding.projectNotFound.currentPath')} <span class="code-string">{project.path}</span>
						</p>
					</div>

					<div class="button-container">
						<Button type="button" style="pop" onclick={async () => await locate(projectId)}
							>{t('onboarding.projectNotFound.locateProject')}</Button
						>
						<RemoveProjectButton
							noModal
							{isDeleting}
							onDeleteClicked={async () => await stopTracking(project.id)}
						/>
					</div>
				{/if}

				{#if deleteSucceeded !== undefined}
					{@const deletionStatus = getDeletionStatus(project.title, deleteSucceeded)}
					<InfoMessage filled outlined={false} style={deletionStatus.style} icon="info">
						{#snippet content()}
							{deletionStatus.message}
						{/snippet}
					</InfoMessage>
				{/if}
			{/snippet}
		</ReduxResult>

		<Spacer dotted margin={0} />
		<ProjectSwitcher {projectId} />
	</div>
</IllustrationSplitLayout>

<style lang="postcss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.button-container {
		display: flex;
		gap: 8px;
	}

	.text-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.title-text {
		color: var(--text-1);
	}

	.description-text {
		color: var(--text-2);
		line-height: 1.6;
	}

	.check-again-btn {
		text-decoration: underline;
	}
</style>
