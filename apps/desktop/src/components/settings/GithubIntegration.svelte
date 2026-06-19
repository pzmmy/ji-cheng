<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import GithubUserLoginState from "$components/settings/GithubUserLoginState.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import githubLogoSvg from "$lib/assets/unsized-logos/github.svg?raw";
	import { CLIPBOARD_SERVICE } from "$lib/backend/clipboard";
	import { URL_SERVICE } from "$lib/backend/url";
	import { GITHUB_USER_SERVICE } from "$lib/forge/github/githubUserService.svelte";
	import { OnboardingEvent, POSTHOG_WRAPPER } from "$lib/telemetry/posthog";
	import { inject } from "@gitbutler/core/context";

	import {
		AddForgeAccountButton,
		Button,
		CardGroup,
		Link,
		Textbox,
		Spacer,
		chipToasts as toasts,
	} from "@gitbutler/ui";
	import { fade } from "svelte/transition";

	const githubUserService = inject(GITHUB_USER_SERVICE);
	const urlService = inject(URL_SERVICE);
	const clipboardService = inject(CLIPBOARD_SERVICE);
	const posthog = inject(POSTHOG_WRAPPER);

	const [clearAll, clearingAllResult] = githubUserService.deleteAllGitHubAccounts();
	const [storePat, storePatResult] = githubUserService.storeGitHubPat;
	const [storeGhePat, storeGhePatResult] = githubUserService.storeGithuibEnterprisePat;
	const accounts = githubUserService.accounts();

	let showingFlow = $state<"oauthFlow" | "pat" | "ghe">();

	// OAuth step flags
	let codeCopied = $state(false);
	let GhActivationLinkPressed = $state(false);
	let GhActivationPageOpened = $state(false);

	let loading = $state(false);
	let userCode = $state("");
	let deviceCode = $state("");

	// PAT flow state
	let patInput = $state<string>();
	let patError = $state<string>();

	// GitHub Enterprise flow state
	let ghePatInput = $state<string>();
	let gheHostInput = $state<string>();
	let ghePatError = $state<string>();
	let gheHostError = $state<string>();

	function cleanupAuthFlow() {
		showingFlow = undefined;
		codeCopied = false;
		GhActivationLinkPressed = false;
		GhActivationPageOpened = false;
	}

	function cleanupPatFlow() {
		showingFlow = undefined;
		patInput = undefined;
		patError = undefined;
	}

	function cleanupGheFlow() {
		showingFlow = undefined;
		ghePatInput = undefined;
		gheHostInput = undefined;
		ghePatError = undefined;
		gheHostError = undefined;
	}

	function gitHubStartOauth() {
		posthog.captureOnboarding(OnboardingEvent.GitHubInitiateOAuth);
		githubUserService.initDeviceOauth().then((verification) => {
			userCode = verification.user_code;
			deviceCode = verification.device_code;
			showingFlow = "oauthFlow";
			// Reset all step flags for a fresh auth flow
			codeCopied = false;
			GhActivationLinkPressed = false;
			GhActivationPageOpened = false;
		});
	}

	async function gitHubOauthCheckStatus(deviceCode: string) {
		loading = true;
		try {
			await githubUserService.checkAuthStatus({ deviceCode });
			toasts.success(t('settings.githubAuthenticated'));
		} catch (err: any) {
			console.error(err);
			toasts.error(t('settings.githubAuthFailed'));
			posthog.captureOnboarding(OnboardingEvent.GitHubOAuthFailed);
		} finally {
			// Reset the auth flow on completion
			cleanupAuthFlow();
			loading = false;
		}
	}

	async function deleteAllGitHubAccounts() {
		await clearAll();
		gitHubStartOauth();
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
			console.error("Failed to store GitHub PAT:", err);
			patError = t('settings.invalidTokenOrNetwork');
			posthog.captureOnboarding(OnboardingEvent.GitHubStorePatFailed);
		}
	}

	function startGitHubEnterpriseFlow() {
		showingFlow = "ghe";
	}

	async function storeGitHubEnterpriseToken() {
		if (!ghePatInput || !gheHostInput) return;
		ghePatError = undefined;
		gheHostError = undefined;
		try {
			await storeGhePat({ accessToken: ghePatInput, host: gheHostInput });
			posthog.captureOnboarding(OnboardingEvent.GitHubStoreGHEPat);
			cleanupGheFlow();
		} catch (err: any) {
			console.error("Failed to store GitHub Enterprise PAT:", err);
			ghePatError = t('settings.invalidTokenOrHost');
			posthog.captureOnboarding(OnboardingEvent.GitHubStoreGHEPatFailed);
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
						{t('settings.failedToLoadGitHubAccounts')}
					{/snippet}
					<Button
						style="pop"
						onclick={deleteAllGitHubAccounts}
						loading={clearingAllResult.current.isLoading}>{t('common.retry')}</Button
					>
				</CardGroup.Item>
			{/snippet}

			<!-- ADD ACCOUNT(S) LIST -->
			{#snippet children(accounts)}
				{@const noAccounts = accounts.length === 0}
				{#each accounts as account}
					<GithubUserLoginState {account} />
				{/each}

				<CardGroup.Item background={accounts.length > 0 ? "var(--bg-2)" : undefined}>
					{#snippet iconSide()}
						<div class="icon-wrapper__logo">
							{@html githubLogoSvg}
						</div>
					{/snippet}

					{#snippet title()}
						{t('settings.integrationGithub')}
					{/snippet}

					{#snippet caption()}
						{t('settings.githubAllowsPR')}
					{/snippet}

					{#snippet actions()}
						{@render addProfileButton(noAccounts)}
					{/snippet}
				</CardGroup.Item>
			{/snippet}
		</ReduxResult>
	</CardGroup>

	<!-- AUTH FLOW -->
	{#if showingFlow === "oauthFlow"}
		<div in:fade={{ duration: 100 }}>
			<CardGroup.Item standalone>
				<div class="close-button-wrapper">
					<Button kind="ghost" style="gray" icon="cross" onclick={cleanupAuthFlow} />
				</div>

				<div class="wrapper">
					<div class="step-section">
						<div class="step-line"></div>
						<div class="step-section__content">
							<p class="text-13 text-body">{t('settings.githubCopyCode')}</p>

							<div class="code-wrapper">
								<span class="text-head-20">
									{userCode}
								</span>
								<Button
									style="gray"
									kind="outline"
									icon="copy"
									disabled={codeCopied}
									onclick={() => {
										clipboardService.write(userCode, { message: t('settings.userCodeCopied') });
										codeCopied = true;
									}}
								>
									{t('settings.copyToClipboard')}
								</Button>
							</div>
						</div>
					</div>

					{#if codeCopied}
						<div class="step-section" in:fade={{ duration: 100 }}>
							<div class="step-line step-line-default"></div>
							<div class="step-section__content">
								<p class="text-13 text-body">
									{t('settings.githubNavigateAndPaste')}
								</p>
								<Button
									style="pop"
									disabled={GhActivationLinkPressed}
									icon="arrow-up-righ"
									onclick={() => {
										urlService.openExternalUrl("https://github.com/login/device");
										GhActivationLinkPressed = true;

										// add timeout to prevent show the check button before the page is opened
										setTimeout(() => {
											GhActivationPageOpened = true;
										}, 500);
									}}
								>
									{t('settings.githubOpenActivationPage')}
								</Button>
							</div>
						</div>
					{/if}

					{#if GhActivationPageOpened}
						<div class="step-section" in:fade={{ duration: 100 }}>
							<div class="step-line step-line-last"></div>
							<div class="step-section__content">
								<Button
									style="pop"
									{loading}
									disabled={loading}
									onclick={async () => {
										await gitHubOauthCheckStatus(deviceCode);
									}}
								>
									{t('settings.githubCheckStatus')}
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</CardGroup.Item>
		</div>

		<!-- PAT FLOW -->
	{:else if showingFlow === "pat"}
		<CardGroup>
			<CardGroup.Item>
				{#snippet title()}
					{t('settings.githubAddPat')}
				{/snippet}

				<Textbox
					size="large"
					type="password"
					value={patInput}
					placeholder="ghp_************************"
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
						{t('settings.githubAddAccount')}
					</Button>
				</div>
			</CardGroup.Item>
		</CardGroup>
	{:else if showingFlow === "ghe"}
		<CardGroup>
			<CardGroup.Item>
				{#snippet title()}
					{t('settings.githubAddEnterprise')}
				{/snippet}

				{#snippet caption()}
					{t('settings.githubEnterpriseDesc')}
					<br />
					{t('settings.seeDocsForDetails')} <Link href="https://docs.gitbutler.com/troubleshooting/custom-csp"
						>{t('settings.docsForDetails')}</Link
					>
				{/snippet}

				<Textbox
					label={t('settings.apiBaseUrl')}
					size="large"
					value={gheHostInput}
					oninput={(value) => (gheHostInput = value)}
					helperText={t('settings.githubApiBaseUrlHelper')}
					error={gheHostError}
				/>
				<Textbox
					label={t('settings.personalAccessToken')}
					placeholder="ghp_************************"
					size="large"
					type="password"
					value={ghePatInput}
					oninput={(value) => (ghePatInput = value)}
					error={ghePatError}
				/>
			</CardGroup.Item>
			<CardGroup.Item>
				<div class="flex justify-end gap-6">
					<Button style="gray" kind="outline" onclick={cleanupGheFlow}>{t('common.cancel')}</Button>
					<Button
						style="pop"
						disabled={!gheHostInput || !ghePatInput}
						loading={storeGhePatResult.current.isLoading}
						onclick={storeGitHubEnterpriseToken}
					>
						{t('settings.githubAddAccount')}
					</Button>
				</div>
			</CardGroup.Item>
		</CardGroup>
	{/if}

	{#if showingFlow}
		<Spacer dotted margin={8} />
	{/if}
</div>

{#snippet addProfileButton(noAccounts: boolean)}
	<AddForgeAccountButton
		{noAccounts}
		disabled={showingFlow !== undefined}
		loading={storePatResult.current.isLoading || storeGhePatResult.current.isLoading}
		menuItems={[
			{ label: t('settings.githubAuthorize'), icon: "link", onclick: gitHubStartOauth },
			{ label: t('settings.githubAddPat'), icon: "lock-auth", onclick: startPatFlow },
			{
				label: t('settings.githubAddEnterprise'),
				icon: "factory",
				onclick: startGitHubEnterpriseFlow,
			},
		]}
	/>
{/snippet}

<style lang="postcss">
	.close-button-wrapper {
		display: flex;
		position: absolute;
		top: 8px;
		right: 8px;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.icon-wrapper__logo {
		width: 28px;
		height: 28px;
	}

	.step-section {
		display: flex;
		margin-left: 8px;
		gap: 16px;

		&:first-child {
			& .step-section__content {
				&::before {
					display: none;
				}
			}
		}
	}

	.step-section__content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		margin-bottom: 12px;
		margin-left: 8px;
		gap: 12px;

		&:before {
			display: block;
			width: 100%;
			height: 1px;
			margin-top: 8px;
			margin-bottom: 6px;
			background-color: var(--border-1);
			content: "";
			opacity: 0.4;
		}
	}

	/* STEP LINES */
	.step-line {
		position: relative;
		width: 1px;
		margin-top: 4px;
		border-right: 1px dashed var(--border-1);

		&::before {
			position: absolute;
			left: 50%;
			width: 10px;
			height: 10px;
			transform: translateX(-50%);
			border-radius: 100%;
			background-color: var(--border-1);
			content: "";
		}
	}

	.step-line-default {
		&::before {
			top: 28px;
		}
	}

	.step-line-last {
		height: 34px;

		&::before {
			top: 32px;
		}
	}

	.code-wrapper {
		display: flex;
		align-items: center;
		align-self: flex-start;
		padding: 6px 6px 6px 8px;
		gap: 10px;
		border: 1px solid var(--border-2);
		border-radius: var(--radius-m);
		background-color: var(--bg-1);
		user-select: text;
	}
</style>
