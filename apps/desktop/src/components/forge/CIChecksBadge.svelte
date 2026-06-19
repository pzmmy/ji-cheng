<script lang="ts">
	import { CHECKS_MONITOR } from "$lib/forge/checksMonitor.svelte";
	import { FORGE_INFO_SERVICE } from "$lib/forge/forgeInfo.svelte";
	import { getPollingInterval } from "$lib/forge/shared/progressivePolling";
	import { UI_STATE } from "$lib/state/uiState.svelte";
	import { inject } from "@gitbutler/core/context";
	import { t } from "$lib/i18n/index.svelte";

	import { Badge, TestId, type MessageStyle, type IconName } from "@gitbutler/ui";
	import type { ComponentColorType } from "@gitbutler/ui/utils/colorTypes";

	type Props = {
		projectId: string;
		branchName: string;
		prUpdatedAt?: string;
		mergeableState?: string;
		hasChecks?: boolean;
		isFork?: boolean;
		isMerged?: boolean;
		onrefetch?: () => void;
	};

	type StatusInfo = {
		text: string;
		reducedText: string;
		icon?: IconName;
		style?: ComponentColorType;
		messageStyle?: MessageStyle;
		tooltip?: string;
	};

	let {
		projectId,
		branchName,
		prUpdatedAt,
		mergeableState,
		isFork,
		isMerged,
		hasChecks = $bindable(),
		onrefetch,
	}: Props = $props();

	const checksMonitor = inject(CHECKS_MONITOR);
	const forgeInfoService = inject(FORGE_INFO_SERVICE);
	const uiState = inject(UI_STATE);

	const forgeInfoQuery = $derived(forgeInfoService.get(projectId));
	const forgeInfo = $derived(forgeInfoQuery.response);
	const checksService = $derived(forgeInfo?.capabilities.checks ? checksMonitor : undefined);
	let elapsedMs = $state<number>(0);
	let loadedOnce = $state(false);

	const projectState = $derived(uiState.project(projectId));
	const isDone = $derived(!projectState.branchesToPoll.current.includes(branchName));

	// Do not create a checks monitor if pull request is merged or from a fork.
	// For more information about unavailability of check-runs for forked repos,
	// see GitHub docs at:
	// https://docs.github.com/en/rest/checks/runs?apiVersion=2022-11-28#list-check-runs-in-a-check-suite
	const enabled = $derived(!isFork && !isMerged); // Deduplication.

	const pollingInterval = $derived(getPollingInterval(elapsedMs, isDone));

	const checksQuery = $derived(
		enabled
			? checksService?.get(projectId, branchName, { subscriptionOptions: { pollingInterval } })
			: undefined,
	);

	const loading = $derived(checksQuery?.result.isLoading);

	const checksTagInfo: StatusInfo = $derived.by(() => {
		const checks = checksQuery?.response;
		if (isFork) {
			return {
				style: "gray",
				icon: undefined,
				text: t('forge.ciChecksBadge.noPrChecks'),
				reducedText: t('forge.ciChecksBadge.noChecks'),
				tooltip: t('forge.ciChecksBadge.forkTooltip'),
			};
		}

		if (checksQuery?.result.error) {
			return {
				style: "danger",
				icon: "warning",
				text: t('forge.ciChecksBadge.failedToLoad'),
				reducedText: t('common.error'),
				tooltip: t('forge.ciChecksBadge.failedToLoadTooltip'),
			};
		}

		if (checks) {
			// When checks pass but the PR is blocked, it's typically because
			// review approval is still required — not a CI issue.
			if (checks.completed && checks.success && mergeableState === "blocked") {
				return {
					style: "warning",
					icon: "eye",
					text: t('forge.ciChecksBadge.needsReview'),
					reducedText: t('forge.ciChecksBadge.needsReview'),
					tooltip: t('forge.ciChecksBadge.needsReviewTooltip'),
				};
			}

			// Merge conflicts can prevent checks from running at all.
			if (mergeableState === "dirty") {
				return {
					style: "danger",
					icon: "warning",
					text: t('forge.ciChecksBadge.hasConflicts'),
					reducedText: t('forge.ciChecksBadge.conflicts'),
					tooltip: t('forge.ciChecksBadge.conflictsTooltip'),
				};
			}

			const style = checks.completed ? (checks.success ? "safe" : "danger") : "warning";
			// Keep the terminal icon stable during background re-fetches
			const icon = checks.completed ? (checks.success ? "tick" : "danger") : "spinner";
			const text = checks.completed
				? checks.success
					? t('forge.ciChecksBadge.checksPassed')
					: t('forge.ciChecksBadge.checksFailed')
				: t('forge.ciChecksBadge.checksRunning');

			const tooltip =
				checks.completed && !checks.success
					? t('forge.ciChecksBadge.checksFailedDetail', { failedChecks: checks.failedChecks.join(", ") })
					: undefined;

			const reducedText = checks.completed ? (checks.success ? t('forge.ciChecksBadge.passed') : t('common.failed')) : t('forge.ciChecksBadge.running');
			return { style, icon, text, reducedText, tooltip };
		}
		if (loading) {
			return {
				style: "gray",
				icon: "spinner",
				text: t('forge.ciChecksBadge.loadingChecks'),
				reducedText: t('forge.ciChecksBadge.checks'),
				tooltip: t('forge.ciChecksBadge.waitingForChecks'),
			};
		}

		return {
			style: "gray",
			icon: undefined,
			text: t('forge.ciChecksBadge.noChecksConfigured'),
			reducedText: t('forge.ciChecksBadge.noChecks'),
			tooltip: t('forge.ciChecksBadge.noChecksTooltip'),
		};
	});
</script>

<Badge
	testId={TestId.PRChecksBadge}
	size="icon"
	icon={checksTagInfo.icon}
	style={checksTagInfo.style}
	kind={checksTagInfo.icon === "tick" ? "solid" : "soft"}
	tooltip={checksTagInfo.tooltip}
	reversedDirection
	onclick={(e) => {
		e.stopPropagation();
		if (!enabled) return;
		// Re-add to polling list so that if new checks are discovered, polling resumes.
		if (isDone) {
			projectState.branchesToPoll.add(branchName);
			loadedOnce = false;
			elapsedMs = 0;
		}
		checksQuery?.result.refetch();
		onrefetch?.();
	}}
>
	<span data-pr-text={checksTagInfo.reducedText} class="truncate">
		{checksTagInfo.reducedText}
	</span>
</Badge>
