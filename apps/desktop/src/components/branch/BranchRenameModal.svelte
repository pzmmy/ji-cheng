<script lang="ts">
	import BranchNameTextbox from "$components/branch/BranchNameTextbox.svelte";
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Button, ElementId, Modal, TestId } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	const { projectId, stackId, laneId, branchName, isPushed }: BranchRenameModalProps = $props();
	const stackService = inject(STACK_SERVICE);

	const [renameBranch, renameQuery] = stackService.updateBranchName;

	let newName: string | undefined = $state();
	let normalizedRefName: string | undefined = $state();
	let isBranchNameValid = $state(false);
	let modal: Modal | undefined = $state();

	let branchNameInput = $state<ReturnType<typeof BranchNameTextbox>>();

	export async function show() {
		newName = branchName;
		modal?.show();
		// Select text after async value is set
		await branchNameInput?.selectAll();
	}
</script>

<Modal
	testId={TestId.BranchHeaderRenameModal}
	width="small"
	title={isPushed ? t('branch.renameModal.titlePushed') : t('branch.renameModal.title')}
	type={isPushed ? "warning" : "info"}
	bind:this={modal}
	onSubmit={async (close) => {
		if (normalizedRefName) {
			renameBranch({ projectId, stackId, laneId, branchName, newName: normalizedRefName });
		}
		close();
	}}
>
	<BranchNameTextbox
		bind:this={branchNameInput}
		placeholder={t('branch.renameModal.placeholder')}
		id={ElementId.NewBranchNameInput}
		bind:value={newName}
		autofocus
		onnormalizedvalue={(value) => (normalizedRefName = value)}
		onvalidationchange={(isValid) => (isBranchNameValid = isValid)}
	/>

	{#if isPushed}
		<div class="text-12 helper-text">
			{t('branch.renameModal.pushedWarning')}
		</div>
	{/if}

	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t('common.cancel')}</Button>
		<Button
			testId={TestId.BranchHeaderRenameModal_ActionButton}
			style="pop"
			type="submit"
			disabled={!isBranchNameValid}
			loading={renameQuery.current.isLoading}>{t('branch.renameModal.rename')}</Button
		>
	{/snippet}
</Modal>

<style lang="postcss">
	.helper-text {
		margin-top: 1rem;
		color: var(--text-2);
		line-height: 1.5;
	}
</style>
