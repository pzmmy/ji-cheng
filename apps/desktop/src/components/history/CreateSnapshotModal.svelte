<script lang="ts" module>
	export type CreateSnapshotModalProps = {
		projectId: string;
	};
</script>

<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { HISTORY_SERVICE } from "$lib/history/history";
	import { inject } from "@gitbutler/core/context";
	import { Button, ElementId, Modal, TestId, Textbox } from "@gitbutler/ui";

	const { projectId }: CreateSnapshotModalProps = $props();

	const historyService = inject(HISTORY_SERVICE);

	let message: string = $state("");
	let modal: Modal | undefined = $state();
	let isCreating = $state(false);

	export function show() {
		message = "";
		modal?.show();
	}

	async function createSnapshot(close: () => void) {
		if (isCreating) return;

		try {
			isCreating = true;
			await historyService.createSnapshot(projectId, message || undefined);
			close();
		} catch (error) {
			console.error("Failed to create snapshot:", error);
		} finally {
			isCreating = false;
		}
	}
</script>

<Modal
	testId={TestId.CreateSnapshotModal}
	width="small"
	title={t('history.createSnapshot.title')}
	type="info"
	bind:this={modal}
	onSubmit={createSnapshot}
>
	<Textbox
		placeholder={t('history.createSnapshot.placeholder')}
		id={ElementId.SnapshotDescriptionInput}
		bind:value={message}
		autofocus
		helperText={t('history.createSnapshot.helperText')}
	/>

	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t('common.cancel')}</Button>
		<Button
			testId={TestId.CreateSnapshotModal_ActionButton}
			style="pop"
			type="submit"
			loading={isCreating}
		>
			{t('history.createSnapshot.createButton')}
		</Button>
	{/snippet}
</Modal>
