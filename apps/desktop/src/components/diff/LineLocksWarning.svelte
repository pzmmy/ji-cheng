<script lang="ts">
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import { getStackName } from "$lib/stacks/stack";
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { TestId } from "@gitbutler/ui";
	import type { DependencyLock } from "@gitbutler/ui/utils/diffParsing";
	import { t } from "$lib/i18n/index.svelte";

	type Props = {
		projectId: string;
		locks: DependencyLock[];
	};

	const { projectId, locks }: Props = $props();

	const stackService = inject(STACK_SERVICE);

	const lockedToStackIds = $derived(
		locks
			.filter((lock) => lock.target.type === "stack")
			.map((lock) => (lock.target as { type: "stack"; subject: string }).subject),
	);
	const stacksQuery = $derived(stackService.stacks(projectId));
</script>

<ReduxResult result={stacksQuery.result} {projectId}>
	{#snippet children(stacks)}
		{@const lockedToStacks = stacks.filter(
			(stack) => stack.id && lockedToStackIds.includes(stack.id),
		)}
		{@const stackNames = lockedToStacks.map(getStackName)}
		<div data-testid={TestId.UnifiedDiffViewLockWarning}>
			{#if stackNames.length > 1}
				<p>{t('diff.dependsOnStacks')}</p>
				<br />
				<p>{stackNames.join(", ")}</p>
			{:else if stackNames.length === 1}
				<p>{t('diff.dependsOnStack', { stack: stackNames[0] })}</p>
			{:else}
				<p>{t('diff.dependsOnUnknown')}</p>
			{/if}
		</div>
	{/snippet}
</ReduxResult>
