<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import GiteeIntegration from "$components/settings/GiteeIntegration.svelte";
	import GithubIntegration from "$components/settings/GithubIntegration.svelte";
	import GitlabIntegration from "$components/settings/GitlabIntegration.svelte";
	import { SETTINGS_SERVICE } from "$lib/settings/appSettings";
	import { inject } from "@gitbutler/core/context";
	import { CardGroup, Spacer, Toggle } from "@gitbutler/ui";

	const settingsService = inject(SETTINGS_SERVICE);
	const appSettings = settingsService.appSettings;

	async function toggleAutoFillPrDescription() {
		await settingsService.updateReviews({
			autoFillPrDescriptionFromCommit: !$appSettings?.reviews.autoFillPrDescriptionFromCommit,
		});
	}
</script>

<GiteeIntegration />
<GithubIntegration />
<GitlabIntegration />
<Spacer />
<CardGroup>
	<CardGroup.Item labelFor="autoFillPrDescription">
		{#snippet title()}
			{t("settings.autoFillPrDesc")}
		{/snippet}
		{#snippet caption()}
			{t("settings.autoFillPrDescCaption")}
		{/snippet}
		{#snippet actions()}
			<Toggle
				id="autoFillPrDescription"
				checked={$appSettings?.reviews.autoFillPrDescriptionFromCommit ?? true}
				onclick={toggleAutoFillPrDescription}
			/>
		{/snippet}
	</CardGroup.Item>
</CardGroup>
