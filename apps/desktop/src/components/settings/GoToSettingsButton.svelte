<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { useSettingsModal } from "$lib/settings/settingsModal.svelte";
	import { Button } from "@gitbutler/ui";

	const { openGeneralSettings } = useSettingsModal();
</script>

<Button
	style="pop"
	icon="login"
	onclick={async () => {
		openGeneralSettings("general");
	}}
>
	{t('settings.goToSettings')}
</Button>
