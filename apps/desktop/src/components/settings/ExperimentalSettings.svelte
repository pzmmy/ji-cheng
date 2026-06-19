<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import {
		fModeEnabled,
		newIntegrateUpstreamModalFeature,
		newPushFeature,
	} from "$lib/config/uiFeatureFlags";
	import { SETTINGS_SERVICE } from "$lib/settings/appSettings";
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Toggle } from "@gitbutler/ui";

	const settingsService = inject(SETTINGS_SERVICE);
	const settingsStore = settingsService.appSettings;

	const userService = inject(USER_SERVICE);
</script>

<p class="text-12 text-body experimental-settings__text">
	{t("settings.experimentalDesc")} Features may not work fully.
	<br />
	{t("settings.experimentalRisk")}
</p>

<CardGroup>
	<CardGroup.Item labelFor="f-mode">
		{#snippet title()}
			{t("settings.fMode")}
		{/snippet}
		{#snippet caption()}
			{t("settings.fModeDesc")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="f-mode"
				checked={$fModeEnabled}
				onclick={() => fModeEnabled.set(!$fModeEnabled)}
			/>
		{/snippet}
	</CardGroup.Item>

	{#if userService.user?.role === "admin"}
		<CardGroup.Item labelFor="single-branch">
			{#snippet title()}
				{t("settings.singleBranch")}
			{/snippet}
			{#snippet caption()}
				{t("settings.singleBranchDesc")}
			{/snippet}
			{#snippet actions()}
				<Toggle
					id="single-branch"
					checked={$settingsStore?.featureFlags.singleBranch}
					onclick={() =>
						settingsService.updateFeatureFlags({
							singleBranch: !$settingsStore?.featureFlags.singleBranch,
						})}
				/>
			{/snippet}
		</CardGroup.Item>
	{/if}

	<CardGroup.Item labelFor="new-push">
		{#snippet title()}
			{t("settings.newPush")}
		{/snippet}
		{#snippet caption()}
			{t("settings.newPushDesc")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="new-push"
				checked={$newPushFeature}
				onclick={() => newPushFeature.set(!$newPushFeature)}
			/>
		{/snippet}
	</CardGroup.Item>

	<CardGroup.Item labelFor="new-integrate-upstream-modal">
		{#snippet title()}
			{t("settings.newIntegrateUpstream")}
		{/snippet}
		{#snippet caption()}
			{t("settings.newIntegrateUpstreamDesc")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="new-integrate-upstream-modal"
				checked={$newIntegrateUpstreamModalFeature}
				onclick={() => newIntegrateUpstreamModalFeature.set(!$newIntegrateUpstreamModalFeature)}
			/>
		{/snippet}
	</CardGroup.Item>

	<CardGroup.Item labelFor="irc">
		{#snippet title()}
			{t("settings.ircIntegration")}
		{/snippet}
		{#snippet caption()}
			{t("settings.ircDesc")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="irc"
				checked={$settingsStore?.featureFlags.irc}
				onclick={() =>
					settingsService.updateFeatureFlags({ irc: !$settingsStore?.featureFlags.irc })}
			/>
		{/snippet}
	</CardGroup.Item>
</CardGroup>

<style>
	.experimental-settings__text {
		margin-bottom: 10px;
		color: var(--text-2);
	}
</style>
