<script lang="ts">
	import BranchBadge from "$components/branch/BranchBadge.svelte";
	import { AvatarGroup, Button } from "@gitbutler/ui";
	import type { Author, PushStatus } from "@gitbutler/but-sdk";
	import type { Snippet } from "svelte";
	import { t } from "$lib/i18n/index.svelte";

	type Props = {
		pushStatus: PushStatus;
		authors: Author[];
		isConflicted: boolean;
		children?: Snippet;
		conflictedCommits?: Snippet;
		onResolveConflicts?: () => void;
	};

	const {
		pushStatus,
		authors,
		isConflicted,
		children,
		conflictedCommits,
		onResolveConflicts,
	}: Props = $props();
</script>

<div class="branch-view">
	<div class="text-12 branch-view__header-container">
		<div class="factoid-wrap">
			<BranchBadge {pushStatus} unstyled />
			<span class="branch-view__details-divider">•</span>
		</div>

		<div class="factoid-wrap">
			<span class="factoid-label">{t('branch.details.contribs')}:</span>
			<AvatarGroup
				maxAvatars={2}
				avatars={authors.map((a) => ({
					username: a.name,
					srcUrl: a.gravatarUrl,
				}))}
			/>
		</div>
	</div>

	{@render children?.()}

	{#if isConflicted && conflictedCommits}
		<div class="header-details__conflicts">
			{@render conflictedCommits?.()}

			<div class="header-details__conflicts-action">
				<div class="stack-v gap-8">
					<h3 class="text-13 text-semibold">{t('branch.details.conflictedCommits')}</h3>
					<p class="text-12 text-body clr-text-2">
						{t('branch.details.conflictDescription')}
					</p>
				</div>
				<Button onclick={onResolveConflicts} style="danger">{t('branch.details.startResolving')}</Button>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.branch-view {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 14px;
		gap: 16px;
	}

	.branch-view__header-container {
		display: flex;
		row-gap: 8px;
		flex-wrap: wrap;
		align-items: center;
		width: 100%;
		color: var(--text-2);
	}

	.factoid-wrap {
		display: flex;
		align-items: center;
	}

	.factoid-label {
		margin-right: 4px;
	}

	.branch-view__details-divider {
		margin: 0 6px;
		color: var(--text-3);
	}

	.header-details__conflicts {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--border-2);
		border-radius: var(--radius-ml);
	}

	.header-details__conflicts-action {
		display: flex;
		flex-direction: column;
		padding: 12px;
		gap: 12px;
	}
</style>
