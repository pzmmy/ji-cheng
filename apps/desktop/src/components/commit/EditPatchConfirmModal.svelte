<script lang="ts">
	import { Modal, Button } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	type Props = {
		fileName: string;
		onConfirm: () => void;
		onCancel: () => void;
	};

	const { fileName, onConfirm, onCancel }: Props = $props();

	let modal: Modal | undefined = $state();

	export function show() {
		modal?.show();
	}

	export function hide() {
		modal?.close();
	}
</script>

<Modal bind:this={modal} width="small" type="warning" title={t('commit.editPatchConfirmModal.title')}>
	<p class="text-base-body-13 text-light">
		{t('commit.editPatchConfirmModal.description', { fileName })}
	</p>

	{#snippet controls()}
		<Button kind="outline" onclick={onCancel}>{t('common.cancel')}</Button>
		<Button style="pop" onclick={onConfirm}>{t('commit.editPatchConfirmModal.resolveConflicts')}</Button>
	{/snippet}
</Modal>
