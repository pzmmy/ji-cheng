<script lang="ts">
	import { persisted } from "@gitbutler/shared/persisted";
	import { t } from "$lib/i18n/index.svelte";

	import {
		Button,
		ContextMenuItem,
		ContextMenuSection,
		DropdownButton,
		TestId,
	} from "@gitbutler/ui";

	interface Props {
		isCreatingPR: boolean;
		canPublishPR: boolean;
		submitDisabled?: boolean;
		isFormBusy?: boolean;
		reviewUnit: string | undefined;
		onCancel: () => void;
		onSubmit: () => void;
	}

	let {
		canPublishPR,
		submitDisabled,
		isCreatingPR,
		isFormBusy,
		onCancel,
		onSubmit,
		reviewUnit,
	}: Props = $props();

	const unit = $derived(reviewUnit ?? "PR");
	let commitButton = $state<DropdownButton>();

	const createDraft = persisted<boolean>(false, "createDraftPr");
</script>

<div class="submit-review-actions">
	<Button
		testId={TestId.ReviewCancelButton}
		kind="outline"
		disabled={isFormBusy || isCreatingPR}
		width={120}
		onclick={onCancel}>{t('common.cancel')}</Button
	>

	<DropdownButton
		testId={TestId.ReviewCreateButton}
		bind:this={commitButton}
		onclick={() => {
			if (isFormBusy || isCreatingPR) return;
			onSubmit();
		}}
		wide
		style="pop"
		loading={isCreatingPR}
		disabled={submitDisabled || isFormBusy}
		hotkey="⌘↵"
	>
		{$createDraft ? t('forge.reviewCreationControls.createDraft', { unit }) : t('forge.reviewCreationControls.create', { unit })}

		{#snippet contextMenuSlot()}
			<ContextMenuSection>
				<ContextMenuItem
					label={t('forge.reviewCreationControls.createDraft', { unit })}
					onclick={() => {
						$createDraft = true;
						commitButton?.close();
					}}
					disabled={!canPublishPR}
				/>

				<ContextMenuItem
					label={t('forge.reviewCreationControls.create', { unit })}
					onclick={() => {
						$createDraft = false;
						commitButton?.close();
					}}
				/>
			</ContextMenuSection>
		{/snippet}
	</DropdownButton>
</div>

<style lang="postcss">
	.submit-review-actions {
		display: flex;
		justify-content: flex-end;
		width: 100%;
		gap: 6px;
	}
</style>
