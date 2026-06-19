<script lang="ts" module>
	export type DeleteBranchModalProps = {
		projectId: string;
		stackId?: string;
		branchName: string;
	};
</script>

<script lang="ts">
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Button, Modal, TestId } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	const { projectId, stackId, branchName }: DeleteBranchModalProps = $props();
	const stackService = inject(STACK_SERVICE);
	const [removeBranch, branchRemovalOp] = stackService.removeBranch;

	let modal = $state<Modal>();

	export function show() {
		modal?.show();
	}
</script>

<Modal
	testId={TestId.BranchHeaderDeleteModal}
	bind:this={modal}
	width="small"
	title={t('branch.deleteModal.title')}
	onSubmit={async (close) => {
		await removeBranch({
			projectId,
			stackId,
			branchName,
		});
		close();
	}}
>
	<p class="text-13 text-body">
		{t('branch.deleteModal.confirm', { branchName })}
	</p>
	{#snippet controls(close)}
		<Button kind="outline" onclick={close} autofocus>{t('common.cancel')}</Button>
		<Button
			testId={TestId.BranchHeaderDeleteModal_ActionButton}
			style="danger"
			type="submit"
			loading={branchRemovalOp.current.isLoading}>{t('common.delete')}</Button
		>
	{/snippet}
</Modal>
