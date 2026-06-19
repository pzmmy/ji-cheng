<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import GiteeUserLoginState from "$components/settings/GiteeUserLoginState.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import giteeLogoSvg from "$lib/assets/unsized-logos/gitee.svg?raw";
	import { GITEE_USER_SERVICE } from "$lib/forge/gitee/giteeUserService.svelte";
	import { OnboardingEvent, POSTHOG_WRAPPER } from "$lib/telemetry/posthog";
	import { inject } from "@gitbutler/core/context";

	import { AddForgeAccountButton, Button, CardGroup, Textbox } from "@gitbutler/ui";
	import { fade } from "svelte/transition";

	const giteeUserService = inject(GITEE_USER_SERVICE);
	const posthog = inject(POSTHOG_WRAPPER);

	const [clearAll, clearingAllResult] = giteeUserService.deleteAllGiteeAccounts();
	const [storePat, storePatResult] = giteeUserService.storeGiteePat;
	const accounts = giteeUserService.accounts();

	let showingFlow = $state<"pat">();

	// PAT flow state
	let patInput = $state<string>();
	let patError = $state<string>();

	function cleanupPatFlow() {
		showingFlow = undefined;
		patInput = undefined;
		patError = undefined;
	}

	async function deleteAllGiteeAccounts() {
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
			posthog.captureOnboarding(OnboardingEvent.GitHubStorePat);
			cleanupPatFlow();
		} catch (err: any) {
			console.error("Failed to store Gitee PAT:", err);
			patError = t('settings.invalidTokenOrNetwork');
			posthog.captureOnboarding(OnboardingEvent.GitHubStorePatFailed);
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
						{t('settings.failedToLoadGiteeAccounts')}
					{/snippet}
					<Button
						style="pop"
						onclick={deleteAllGiteeAccounts}
						loading={clearingAllResult.current.isLoading}>{t('common.retry')}</Button
					>
				</CardGroup.Item>
			{/snippet}

			<!-- ADD ACCOUNT(S) LIST -->
			{#snippet children(accounts)}
				{@const noAccounts = accounts.length === 0}
				{#each accounts as account}
					<GiteeUserLoginState {account} />
				{/each}

				<CardGroup.Item background={accounts.length > 0 ? "var(--bg-2)" : undefined}>
					{#snippet iconSide()}
						<div class="icon-wrapper__logo">
							{@html giteeLogoSvg}
						</div>
					{/snippet}

					{#snippet title()}
						{t('settings.integrationGitee')}
					{/snippet}

					{#snippet caption()}
						{t('settings.giteeAllowsPR')}
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
						{t('settings.giteeAddPat')}
					{/snippet}

					<Textbox
						size="large"
						type="password"
						value={patInput}
						placeholder="*********************************"
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
							{t('settings.giteeAddAccount')}
						</Button>
					</div>
				</CardGroup.Item>
			</CardGroup>
		</div>
	{/if}
</div>

<p class="text-12 text-body gitee-integration-settings__text">
	{t('settings.credentialsPersistedLocally')}
</p>

{#snippet addProfileButton(noAccounts: boolean)}
	<AddForgeAccountButton
		{noAccounts}
		disabled={showingFlow !== undefined}
		loading={storePatResult.current.isLoading}
		menuItems={[
			{ label: t('settings.giteeAddPat'), icon: "lock-auth", onclick: startPatFlow },
		]}
	/>
{/snippet}

<style lang="postcss">
	.icon-wrapper__logo {
		width: 28px;
		height: 28px;
	}

	.gitee-integration-settings__text {
		color: var(--text-2);
	}
</style>
