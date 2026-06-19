<script lang="ts">
	import { GiteeIssueService, type GiteeIssue } from "$lib/forge/gitee/giteeIssueService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { useGiteeAccessToken } from "$lib/forge/gitee/hooks.svelte";

	let {
		projectId,
		owner = "owner",
		repo = "repo",
	}: { projectId: string; owner?: string; repo?: string } = $props();

	const giteeIssueService = inject(GiteeIssueService);
	const giteeAccess = useGiteeAccessToken({ current: projectId });

	let selectedState = $state("open");
	let issuesQuery = $derived(
		giteeIssueService.listIssues({
			owner,
			repo,
			state: selectedState,
		}),
	);
	let issues = $derived(issuesQuery.result?.data ?? []);
	let isLoading = $derived(issuesQuery.result?.isLoading ?? false);
	let error = $derived(issuesQuery.result?.error);

	let selectedIssue = $state<GiteeIssue | null>(null);

	let showCreateDialog = $state(false);
	let createTitle = $state("");
	let createBody = $state("");
	let isCreating = $state(false);

	function toggleIssue(issue: GiteeIssue) {
		if (selectedIssue?.number === issue.number) {
			selectedIssue = null;
		} else {
			selectedIssue = issue;
		}
	}

	function openCreateDialog() {
		createTitle = "";
		createBody = "";
		showCreateDialog = true;
	}

	async function handleCreate() {
		if (!createTitle.trim()) return;
		isCreating = true;
		try {
			await giteeIssueService.createIssue().mutateAsync({
				owner,
				repo,
				title: createTitle.trim(),
				body: createBody.trim(),
			});
			showCreateDialog = false;
		} finally {
			isCreating = false;
		}
	}

	async function handleToggleState(issue: GiteeIssue) {
		const newState = issue.state === "open" ? "closed" : "open";
		await giteeIssueService.updateIssue().mutateAsync({
			owner,
			repo,
			number: issue.number,
			state: newState,
		});
		// Refresh list
		issuesQuery.refetch?.();
	}

	function handleFilterChange(state: string) {
		selectedState = state;
		selectedIssue = null;
	}
</script>

<div class="gitee-issue-panel">
	<div class="header">
		<h3>Issues</h3>
		<div class="controls">
			<div class="filter-buttons">
				<button
					class="filter-btn"
					class:active={selectedState === "open"}
					onclick={() => handleFilterChange("open")}
				>
					Open
				</button>
				<button
					class="filter-btn"
					class:active={selectedState === "closed"}
					onclick={() => handleFilterChange("closed")}
				>
					Closed
				</button>
				<button
					class="filter-btn"
					class:active={selectedState === "all"}
					onclick={() => handleFilterChange("all")}
				>
					All
				</button>
			</div>
			<button class="create-btn" onclick={openCreateDialog}>
				+ New Issue
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="loading">Loading issues...</div>
	{:else if error}
		<div class="error">Error: {error.message}</div>
	{:else if issues.length === 0}
		<div class="empty">No {selectedState} issues found.</div>
	{:else}
		<div class="issue-list">
			{#each issues as issue (issue.number)}
				<div
					class="issue-item"
					class:expanded={selectedIssue?.number === issue.number}
					onclick={() => toggleIssue(issue)}
				>
					<div class="issue-summary">
						<span
							class="state-indicator"
							class:open={issue.state === "open"}
							class:closed={issue.state === "closed"}
						>
							{issue.state === "open" ? "○" : "●"}
						</span>
						<span class="issue-number">#{issue.number}</span>
						<span class="issue-title">{issue.title}</span>
						<span class="issue-meta">
							{#if issue.user}
								<span class="issue-user">{issue.user.login}</span>
							{/if}
							<span class="issue-comments">{issue.comments} comments</span>
						</span>
					</div>
					{#if selectedIssue?.number === issue.number}
						<div class="issue-detail">
							{#if issue.body}
								<div class="issue-body">{issue.body}</div>
							{/if}
							{#if issue.labels.length > 0}
								<div class="issue-labels">
									{#each issue.labels as label}
										<span class="label">{label.name}</span>
									{/each}
								</div>
							{/if}
							<div class="issue-actions">
								{#if issue.state === "open"}
									<button class="action-btn close-btn" onclick={() => handleToggleState(issue)}>
										Close Issue
									</button>
								{:else}
									<button class="action-btn reopen-btn" onclick={() => handleToggleState(issue)}>
										Reopen Issue
									</button>
								{/if}
							</div>
							<div class="issue-dates">
								{#if issue.createdAt}
									<span>Created: {issue.createdAt}</span>
								{/if}
								{#if issue.updatedAt}
									<span>Updated: {issue.updatedAt}</span>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showCreateDialog}
	<div class="dialog-overlay" onclick={() => (showCreateDialog = false)}>
		<div class="dialog" onclick={(e) => e.stopPropagation()}>
			<h3>Create Issue</h3>
			<div class="form-group">
				<label for="issue-title">Title</label>
				<input
					id="issue-title"
					type="text"
					bind:value={createTitle}
					placeholder="Issue title"
				/>
			</div>
			<div class="form-group">
				<label for="issue-body">Description</label>
				<textarea
					id="issue-body"
					bind:value={createBody}
					placeholder="Issue description (optional)"
					rows="5"
				></textarea>
			</div>
			<div class="dialog-actions">
				<button class="cancel-btn" onclick={() => (showCreateDialog = false)}>
					Cancel
				</button>
				<button
					class="submit-btn"
					onclick={handleCreate}
					disabled={!createTitle.trim() || isCreating}
				>
					{isCreating ? "Creating..." : "Create"}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.gitee-issue-panel {
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 8px;
		padding: 16px;
		background: var(--bg-color, #fff);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16px;
	}

	.header h3 {
		margin: 0;
		font-size: 1.1em;
	}

	.controls {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.filter-buttons {
		display: flex;
		gap: 4px;
	}

	.filter-btn {
		padding: 4px 12px;
		border: 1px solid var(--border-color, #d0d0d0);
		border-radius: 4px;
		background: transparent;
		cursor: pointer;
		font-size: 0.85em;
	}

	.filter-btn.active {
		background: var(--accent-color, #0969da);
		color: white;
		border-color: var(--accent-color, #0969da);
	}

	.create-btn {
		padding: 6px 14px;
		background: var(--accent-color, #0969da);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85em;
		font-weight: 500;
	}

	.loading,
	.error,
	.empty {
		padding: 24px;
		text-align: center;
		color: var(--text-muted, #666);
	}

	.error {
		color: var(--error-color, #d32f2f);
	}

	.issue-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.issue-item {
		border: 1px solid var(--border-color, #e8e8e8);
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.issue-item:hover {
		background: var(--hover-bg, #f6f8fa);
	}

	.issue-summary {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
	}

	.state-indicator {
		font-size: 1.1em;
		flex-shrink: 0;
	}

	.state-indicator.open {
		color: var(--success-color, #2da44e);
	}

	.state-indicator.closed {
		color: var(--closed-color, #8250df);
	}

	.issue-number {
		color: var(--text-muted, #656d76);
		font-size: 0.85em;
		flex-shrink: 0;
		font-family: monospace;
	}

	.issue-title {
		flex: 1;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.issue-meta {
		font-size: 0.8em;
		color: var(--text-muted, #656d76);
		display: flex;
		gap: 12px;
		flex-shrink: 0;
	}

	.issue-detail {
		padding: 12px 16px 16px 38px;
		border-top: 1px solid var(--border-color, #eee);
	}

	.issue-body {
		margin-bottom: 12px;
		white-space: pre-wrap;
		font-size: 0.9em;
		line-height: 1.5;
	}

	.issue-labels {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.label {
		padding: 2px 8px;
		border-radius: 12px;
		background: var(--label-bg, #ddf4ff);
		color: var(--label-color, #0969da);
		font-size: 0.75em;
		font-weight: 500;
	}

	.issue-actions {
		margin-bottom: 8px;
	}

	.action-btn {
		padding: 6px 16px;
		border: 1px solid var(--border-color, #d0d0d0);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85em;
		background: transparent;
	}

	.close-btn {
		color: var(--error-color, #d32f2f);
		border-color: var(--error-color, #d32f2f);
	}

	.reopen-btn {
		color: var(--success-color, #2da44e);
		border-color: var(--success-color, #2da44e);
	}

	.issue-dates {
		font-size: 0.75em;
		color: var(--text-muted, #8b949e);
		display: flex;
		gap: 16px;
	}

	/* Dialog styles */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background: var(--bg-color, #fff);
		border-radius: 12px;
		padding: 24px;
		min-width: 400px;
		max-width: 90vw;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
	}

	.dialog h3 {
		margin: 0 0 16px;
	}

	.form-group {
		margin-bottom: 12px;
	}

	.form-group label {
		display: block;
		margin-bottom: 4px;
		font-size: 0.85em;
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--border-color, #d0d0d0);
		border-radius: 6px;
		font-size: 0.9em;
		box-sizing: border-box;
	}

	.form-group textarea {
		resize: vertical;
		font-family: inherit;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 16px;
	}

	.cancel-btn {
		padding: 8px 16px;
		border: 1px solid var(--border-color, #d0d0d0);
		border-radius: 6px;
		background: transparent;
		cursor: pointer;
	}

	.submit-btn {
		padding: 8px 16px;
		background: var(--accent-color, #0969da);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
