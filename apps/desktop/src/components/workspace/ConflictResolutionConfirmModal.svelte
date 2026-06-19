<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { AsyncButton, Button, Modal } from "@gitbutler/ui";

	interface Props {
		onSubmit: () => void;
	}

	const { onSubmit }: Props = $props();

	let modalEl = $state<ReturnType<typeof Modal>>();

	export function show() {
		modalEl?.show();
	}
	export function close() {
		modalEl?.close();
	}
</script>

<Modal bind:this={modalEl} width="small">
	<div>
		<p>{t('workspace.conflictResolution.bottomUpHint')}</p>
		<br />
		<p>{t('workspace.conflictResolution.confirmQuestion')}</p>
	</div>
	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t('common.cancel')}</Button>
		<AsyncButton
			style="pop"
			action={async () => {
				await onSubmit();
				close();
			}}>{t('workspace.conflictResolution.yes')}</AsyncButton
		>
	{/snippet}
</Modal>
