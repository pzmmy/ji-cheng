<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import GitlabUserLoginState from "$components/settings/GitlabUserLoginState.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import gitlabLogoSvg from "$lib/assets/unsized-logos/gitlab.svg?raw";
	import { GITLAB_USER_SERVICE } from "$lib/forge/gitlab/gitlabUserService.svelte";
	import { OnboardingEvent, POSTHOG_WRAPPER } from "$lib/telemetry/posthog";
	import { inject } from "@gitbutler/core/context";

	import { AddForgeAccountButton, Button, CardGroup, Link, Textbox } from "@gitbutler/ui";
	import { fade } from "svelte/transition";

	const gitlabUserService = inject(GITLAB_USER_SERVICE);
	const posthog = inject(POSTHOG_WRAPPER);

	const [clearAll, clearingAllResult] = gitlabUserService.deleteAllGitLabAccounts();
	const [storePat, storePatResult] = gitlabUserService.storeGitLabPat;
	const [storeSelfHostedPat, storeSelfHostedPatResult] = gitlabUserService.storeGitLabEnterprisePat;
	const accounts = gitlabUserService.accounts();

	let showingFlow = $state<"pat" | "selfHosted">();

	// PAT flow state
	let patInput = $state<string>();
	let patError = $state<string>();

	// Self-hosted GitLab flow state
	let selfHostedPatInput = $state<string>();
	let selfHostedHostInput = $state<string>();
	let selfHostedPatError = $state<string>();
	let selfHostedHostError = $state<string>();

	function cleanupPatFlow() {
		showingFlow = undefined;
		patInput = undefined;
		patError = undefined;
	}

	function cleanupSelfHostedFlow() {
		showingFlow = undefined;
		selfHostedPatInput = undefined;
		selfHostedHostInput = undefined;
		selfHostedPatError = undefined;
		selfHostedHostError = undefined;
	}

	async function deleteAllGitLabAccounts() {
		await clearAll();
		startPatFlow();
	}

	function startPatFlow() {
		showingFlow = "pat";
	}

	async function storePersonalAccessToken() {
		if (!patInput) return;
		patError = undefined;
		try {
			await storePat({ accessToken: patInput });
			posthog.captureOnboarding(OnboardingEvent.GitLabStorePat);
			cleanupPatFlow();
		} catch (err: any) {
			console.error("Failed to store GitLab PAT:", err);
			patError = "Invalid token or network error";
			posthog.captureOnboarding(OnboardingEvent.GitLabStorePatFailed);
		}
	}

	function startSelfHostedFlow() {
		showingFlow = "selfHosted";
	}

	async function storeSelfHostedToken() {
		if (!selfHostedPatInput || !selfHostedHostInput) return;
		selfHostedPatError = undefined;
		selfHostedHostError = undefined;
		try {
			await storeSelfHostedPat({ accessToken: selfHostedPatInput, host: selfHostedHostInput });
			posthog.captureOnboarding(OnboardingEvent.GitLabStoreSelfHostedPat);
			cleanupSelfHostedFlow();
		} catch (err: any) {
			console.error("Failed to store self-hosted GitLab PAT:", err);
			selfHostedPatError = "Invalid token or host";
			posthog.captureOnboarding(OnboardingEvent.GitLabStoreSelfHostedPatFailed);
		}
	}
</script>

<div class="stack-v gap-8">
	<CardGroup>
		<ReduxResult result={accounts.result}>
			<!-- IF ERROR -->
			{#snippet error()}
				<CardGroup.Item>
					{#snippet title()}
						{t('settings.failedToLoadGitLabAccounts')}
					{/snippet}
					<Button
						style="pop"
						onclick={deleteAllGitLabAccounts}
						loading={clearingAllResult.current.isLoading}>{t('common.retry')}</Button
					>
				</CardGroup.Item>
			{/snippet}

			<!-- ADD ACCOUNT(S) LIST -->
			{#snippet children(accounts)}
				{@const noAccounts = accounts.length === 0}
				{#each accounts as account}
					<GitlabUserLoginState {account} />
				{/each}

				<CardGroup.Item background={accounts.length > 0 ? "var(--bg-2)" : undefined}>
					{#snippet iconSide()}
						<div class="icon-wrapper__logo">
							{@html gitlabLogoSvg}
						</div>
					{/snippet}

					{#snippet title()}
						{t('settings.integrationGitlab')}
					{/snippet}

					{#snippet caption()}
						{t('settings.gitlabAllowsMR')}
					{/snippet}

					{#snippet actions()}
						{@render addProfileButton(noAccounts)}
					{/snippet}
				</CardGroup.Item>
			{/snippet}
		</ReduxResult>
	</CardGroup>

	<!-- PAT FLOW -->
	{#if showingFlow === "pat"}
		<div in:fade={{ duration: 100 }}>
			<CardGroup>
				<CardGroup.Item>
					{#snippet title()}
						{t('settings.gitlabAddPat')}
					{/snippet}

					<Textbox
						size="large"
						type="password"
						value={patInput}
						placeholder="glpat-************************"
						oninput={(value) => (patInput = value)}
						error={patError}
					/>
				</CardGroup.Item>
				<CardGroup.Item>
					<div class="flex justify-end gap-6">
						<Button style="gray" kind="outline" onclick={cleanupPatFlow}>{t('common.cancel')}</Button>
						<Button
							style="pop"
							disabled={!patInput}
							loading={storePatResult.current.isLoading}
							onclick={storePersonalAccessToken}
						>
							{t('settings.gitlabAddAccount')}
						</Button>
					</div>
				</CardGroup.Item>
			</CardGroup>
		</div>
	{:else if showingFlow === "selfHosted"}
		<div in:fade={{ duration: 100 }}>
			<CardGroup>
				<CardGroup.Item>
					{#snippet title()}
						{t('settings.gitlabAddSelfHosted')}
					{/snippet}

					{#snippet caption()}
						{t('settings.gitlabSelfHostedDesc')}
						<br />
						{t('settings.seeDocsForDetails')} <Link href="https://docs.gitbutler.com/troubleshooting/custom-csp"
							>{t('settings.docsForDetails')}</Link
						>
					{/snippet}

					<Textbox
						label={t('settings.apiBaseUrl')}
						size="large"
						value={selfHostedHostInput}
						oninput={(value) => (selfHostedHostInput = value)}
						helperText={t('settings.gitlabApiBaseUrlHelper')}
						error={selfHostedHostError}
					/>
					<Textbox
						label={t('settings.personalAccessToken')}
						placeholder="glpat-************************"
						size="large"
						type="password"
						value={selfHostedPatInput}
						oninput={(value) => (selfHostedPatInput = value)}
						error={selfHostedPatError}
					/>
				</CardGroup.Item>
				<CardGroup.Item>
					<div class="flex justify-end gap-6">
						<Button style="gray" kind="outline" onclick={cleanupSelfHostedFlow}>{t('common.cancel')}</Button>
						<Button
							style="pop"
							disabled={!selfHostedHostInput || !selfHostedPatInput}
							loading={storeSelfHostedPatResult.current.isLoading}
							onclick={storeSelfHostedToken}
						>
							{t('settings.gitlabAddAccount')}
						</Button>
					</div>
				</CardGroup.Item>
			</CardGroup>
		</div>
	{/if}
</div>

<p class="text-12 text-body gitlab-integration-settings__text">
	{t('settings.credentialsPersistedLocally')}
</p>

{#snippet addProfileButton(noAccounts: boolean)}
	<AddForgeAccountButton
		{noAccounts}
		disabled={showingFlow !== undefined}
		loading={storePatResult.current.isLoading || storeSelfHostedPatResult.current.isLoading}
		menuItems={[
			{ label: t('settings.gitlabAddPat'), icon: "lock-auth", onclick: startPatFlow },
			{
				label: t('settings.gitlabAddSelfHosted'),
				icon: "factory",
				onclick: startSelfHostedFlow,
			},
		]}
	/>
{/snippet}

<style lang="postcss">
	.icon-wrapper__logo {
		width: 28px;
		height: 28px;
	}

	.gitlab-integration-settings__text {
		color: var(--text-2);
	}
</style>
