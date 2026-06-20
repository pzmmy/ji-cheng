<script lang="ts">
	import { goto } from "$app/navigation";
	import WelcomeAction from "$components/onboarding/WelcomeAction.svelte";
	import AccessTokenSignIn from "$components/shared/AccessTokenSignIn.svelte";
	import IconLink from "$components/shared/IconLink.svelte";
	import cloneRepoSvg from "$lib/assets/welcome/clone-repo.svg?raw";
	import newProjectSvg from "$lib/assets/welcome/new-local-project.svg?raw";
	import { handleAddProjectOutcome } from "$lib/project/project";
	import { PROJECTS_SERVICE } from "$lib/project/projectsService";
	import { OnboardingEvent, POSTHOG_WRAPPER } from "$lib/telemetry/posthog";
	import { inject } from "@gitbutler/core/context";
	import { Icon, TestId } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	const projectsService = inject(PROJECTS_SERVICE);
	const posthog = inject(POSTHOG_WRAPPER);
	const serverCapabilitiesQuery = $derived(projectsService.serverCapabilities());
	const canAddProjects = $derived(serverCapabilitiesQuery.response?.canAddProjects ?? true);

	let newProjectLoading = $state(false);
	let directoryInputElement = $state<HTMLInputElement | undefined>();

	async function onNewProject() {
		newProjectLoading = true;
		try {
			const testDirectoryPath = directoryInputElement?.value;
			const outcome = await projectsService.addProject(testDirectoryPath ?? "");

			posthog.captureOnboarding(OnboardingEvent.AddLocalProject);
			if (outcome) {
				handleAddProjectOutcome(outcome);
			}
		} catch (e: unknown) {
			posthog.captureOnboarding(OnboardingEvent.AddLocalProjectFailed, e);
		} finally {
			newProjectLoading = false;
		}
	}

	async function onCloneProject() {
		goto("/onboarding/clone");
	}

	function onConfigureGitee() {
		goto("/settings");
	}

	function onConfigureAi() {
		goto("/settings");
	}
</script>

<div class="welcome" data-testid={TestId.WelcomePage}>
	<h1 class="welcome-title text-serif-42">{t('onboarding.welcome.title')}</h1>
	<div class="welcome__actions">
		<div class="welcome__actions--repo">
			<input
				type="text"
				hidden
				bind:this={directoryInputElement}
				data-testid="test-directory-path"
			/>
			{#if canAddProjects}
				<WelcomeAction
					title={t('onboarding.welcome.addLocalProject')}
					loading={newProjectLoading}
					onclick={onNewProject}
					dimMessage
					testId={TestId.WelcomePageAddLocalProjectButton}
				>
					{#snippet icon()}
						{@html newProjectSvg}
					{/snippet}
					{#snippet message()}
						{t('onboarding.welcome.addLocalProjectDesc')}
					{/snippet}
				</WelcomeAction>
			{/if}
			<WelcomeAction title={t('onboarding.welcome.cloneRepo')} onclick={onCloneProject} dimMessage>
				{#snippet icon()}
					{@html cloneRepoSvg}
				{/snippet}
				{#snippet message()}
					{t('onboarding.welcome.cloneRepoDesc')}
				{/snippet}
			</WelcomeAction>
			<WelcomeAction title={t('onboarding.welcome.configureGitee')} onclick={onConfigureGitee} dimMessage>
				{#snippet icon()}
					<Icon name="settings" />
				{/snippet}
				{#snippet message()}
					{t('onboarding.welcome.configureGiteeDesc')}
				{/snippet}
			</WelcomeAction>
			<WelcomeAction title={t('onboarding.welcome.configureAi')} onclick={onConfigureAi} dimMessage>
				{#snippet icon()}
					<Icon name="ai" />
				{/snippet}
				{#snippet message()}
					{t('onboarding.welcome.configureAiDesc')}
				{/snippet}
			</WelcomeAction>
		</div>
		<!-- Using instance of user here to not hide after login -->
		<AccessTokenSignIn />
	</div>

	<div class="links">
		<div class="links__section">
			<p class="links__title text-14 text-bold">{t('onboarding.welcome.quickStart')}</p>
			<div class="education-links">
				<IconLink
					icon="docs"
					href="https://pzmmy.github.io/ji-cheng/"
				>
					{t('onboarding.welcome.docs')}
				</IconLink>
				<IconLink icon="youtube" href="https://www.youtube.com/@gitbutlerapp">
					{t('onboarding.welcome.tutorials')}
				</IconLink>
			</div>
		</div>
		<div class="links__section">
			<p class="links__title text-14 text-bold">{t('onboarding.welcome.joinCommunity')}</p>
			<div class="community-links">
				<IconLink icon="github" href="https://github.com/pzmmy/ji-cheng/issues">
					{t('onboarding.welcome.githubIssues')}
				</IconLink>
				<IconLink icon="link" href="https://gitee.com">
					{t('onboarding.welcome.gitee')}
				</IconLink>
				<IconLink icon="youtube" href="https://www.youtube.com/@gitbutlerapp">YouTube</IconLink>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.welcome {
		width: 100%;
	}

	.welcome-title {
		color: var(--text-1);
		line-height: 1;
	}

	.welcome__actions {
		display: flex;
		flex-direction: column;
		margin-top: 32px;
		gap: 8px;
	}

	.welcome__actions--repo {
		display: flex;
		gap: 8px;
	}

	.links {
		display: flex;
		margin-top: 20px;
		padding: 28px;
		gap: 56px;
		border-radius: var(--radius-m);
		background: var(--bg-mute);
	}

	.links__section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.education-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-left: -6px;
		gap: 6px;
	}

	.community-links {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 12px;
		row-gap: 4px;
		max-width: 192px;
		margin-left: -6px;
	}

	/* SMALL ILLUSTRATIONS */
</style>
