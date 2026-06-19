<script lang="ts" module>
	export type AddDependentBranchModalProps = {
		projectId: string;
		stackId: string;
	};
</script>

<script lang="ts">
	import BranchNameTextbox from "$components/branch/BranchNameTextbox.svelte";
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Button, Modal, TestId } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";

	const { projectId, stackId }: AddDependentBranchModalProps = $props();

	const stackService = inject(STACK_SERVICE);
	const [createNewBranch, branchCreation] = stackService.newBranch;

	let modal = $state<Modal>();
	let branchName = $state<string>();
	let normalizedRefName: string | undefined = $state();
	let isBranchNameValid = $state(false);

	async function handleAddDependentBranch(close: () => void) {
		if (!normalizedRefName) return;

		await createNewBranch({
			projectId,
			stackId,
			request: {
				targetPatch: undefined,
				name: normalizedRefName,
			},
		});

		close();
	}

	export function show() {
		modal?.show();
	}
</script>

<Modal
	testId={TestId.BranchHeaderAddDependanttBranchModal}
	bind:this={modal}
	width="small"
	title={t('branch.addDependentBranch.title')}
	onSubmit={handleAddDependentBranch}
>
	<div class="content-wrap">
		<BranchNameTextbox
			placeholder={t('branch.addDependentBranch.placeholder')}
			bind:value={branchName}
			autofocus
			onnormalizedvalue={(value) => (normalizedRefName = value)}
			onvalidationchange={(isValid) => (isBranchNameValid = isValid)}
		/>
	</div>
	{#snippet controls(close)}
		<Button kind="outline" type="reset" onclick={close}>{t('common.cancel')}</Button>
		<Button
			testId={TestId.BranchHeaderAddDependanttBranchModal_ActionButton}
			style="pop"
			type="submit"
			disabled={!isBranchNameValid}
			loading={branchCreation.current.isLoading}>{t('branch.addDependentBranch.addBranch')}</Button
		>
	{/snippet}
</Modal>
