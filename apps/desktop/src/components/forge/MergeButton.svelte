<script lang="ts">
	import { FORGE_INFO_SERVICE } from "$lib/forge/forgeInfo.svelte";
	import { MergeMethod } from "$lib/forge/interface/types";
	import { inject } from "@gitbutler/core/context";
	import { t } from "$lib/i18n/index.svelte";
	import { persisted, type Persisted } from "@gitbutler/shared/persisted";

	import { ContextMenuItem, ContextMenuSection, DropdownButton, TestId } from "@gitbutler/ui";
	import { untrack } from "svelte";
	import type { ButtonProps } from "@gitbutler/ui";

	interface Props {
		projectId: string;
		onclick: (method: MergeMethod) => Promise<void>;
		disabled?: boolean;
		wide?: boolean;
		tooltip?: string;
		style?: ButtonProps["style"];
		kind?: ButtonProps["kind"];
		isDraft?: boolean;
		onSetDraft?: (draft: boolean) => Promise<void>;
	}

	const {
		projectId,
		onclick,
		disabled = false,
		wide = false,
		tooltip = "",
		style = "gray",
		kind = "outline",
		isDraft = false,
		onSetDraft,
	}: Props = $props();

	const forgeInfoService = inject(FORGE_INFO_SERVICE);
	const forgeInfoQuery = $derived(forgeInfoService.get(projectId));
	const isGitLab = $derived(forgeInfoQuery.response?.name === "gitlab");

	function persistedAction(projectId: string): Persisted<MergeMethod> {
		const key = "projectMergeMethod";
		return persisted<MergeMethod>(MergeMethod.Merge, key + projectId);
	}

	const action = persistedAction(untrack(() => projectId));

	// If GitLab and action is rebase, reset to merge
	$effect(() => {
		if (isGitLab && $action === MergeMethod.Rebase) {
			$action = MergeMethod.Merge;
		}
	});

	let dropDown: ReturnType<typeof DropdownButton> | undefined;
	let loading = $state(false);

	// Available merge methods based on forge type
	const availableMethods = $derived(
		isGitLab
			? [MergeMethod.Merge, MergeMethod.Squash]
			: [MergeMethod.Merge, MergeMethod.Rebase, MergeMethod.Squash],
	);

	const labels = $derived({
		[MergeMethod.Merge]: t('forge.mergeButton.merge'),
		[MergeMethod.Rebase]: t('forge.mergeButton.rebaseAndMerge'),
		[MergeMethod.Squash]: t('forge.mergeButton.squashAndMerge'),
	});
</script>

<DropdownButton
	bind:this={dropDown}
	testId={TestId.PRMergeButton}
	onclick={async () => {
		loading = true;
		try {
			await onclick?.($action);
		} finally {
			loading = false;
		}
	}}
	{style}
	{kind}
	{loading}
	{wide}
	{tooltip}
	{disabled}
>
	{labels[$action]}
	{#snippet contextMenuSlot()}
		<ContextMenuSection>
			{#each availableMethods as method}
				<ContextMenuItem
					label={labels[method]}
					onclick={() => {
						$action = method;
						dropDown?.close();
					}}
				/>
			{/each}
		</ContextMenuSection>
		{#if onSetDraft}
			<ContextMenuSection>
				<ContextMenuItem
					label={isDraft ? t('forge.mergeButton.readyForReview') : t('forge.mergeButton.convertToDraft')}
					onclick={async () => {
						dropDown?.close();
						loading = true;
						try {
							await onSetDraft(!isDraft);
						} finally {
							loading = false;
						}
					}}
				/>
			</ContextMenuSection>
		{/if}
	{/snippet}
</DropdownButton>
