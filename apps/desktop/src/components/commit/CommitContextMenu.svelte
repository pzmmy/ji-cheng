<script lang="ts" module>
	import type { CommitStatusType } from "$lib/commits/commit";
	interface BaseContextData {
		commitStatus: CommitStatusType;
		commitId: string;
		commitMessage: string;
		commitUrl?: string;
	}

	interface LocalCommitContextData extends BaseContextData {
		commitStatus: "LocalOnly" | "LocalAndRemote";
		stackId?: string;
		onUncommitClick: (event: MouseEvent) => void;
		onEditMessageClick: (event: MouseEvent) => void;
		/** When set, indicates multiple commits are selected. */
		multiSelect?: {
			commitIds: string[];
			onSquashSelected: () => void;
			onUncommitSelected: () => void;
		};
	}

	interface RemoteCommitContextData extends BaseContextData {
		commitStatus: "Remote";
		stackId?: string;
	}

	interface IntegratedCommitContextData extends BaseContextData {
		commitStatus: "Integrated";
		stackId?: string;
	}

	interface BaseCommitContextData extends BaseContextData {
		commitStatus: "Base";
	}

	export type CommitContextData =
		| LocalCommitContextData
		| RemoteCommitContextData
		| IntegratedCommitContextData
		| BaseCommitContextData;

	export type CommitMenuContext = {
		position: { coords?: { x: number; y: number }; element?: HTMLElement };
		data: CommitContextData;
	};
</script>

<script lang="ts">
	import IrcSendToSubmenus from "$components/diff/IrcSendToSubmenus.svelte";
	import { CLIPBOARD_SERVICE } from "$lib/backend/clipboard";
	import { URL_SERVICE } from "$lib/backend/url";
	import { rewrapCommitMessage } from "$lib/config/uiFeatureFlags";
	import { DIFF_SERVICE } from "$lib/hunks/diffService.svelte";
	import { IRC_API_SERVICE } from "$lib/irc/ircApiService";
	import { Messages, serialize } from "$lib/irc/protocol";
	import { buildSharedCommitPayload } from "$lib/irc/sharedStack";
	import { editPatch } from "$lib/mode/editPatchUtils";
	import { MODE_SERVICE } from "$lib/mode/modeService";
	import { PROJECTS_SERVICE } from "$lib/project/projectsService";
	import { STACK_SERVICE } from "$lib/stacks/stackService.svelte";
	import { inject, injectOptional } from "@gitbutler/core/context";
	import {
		ContextMenuItem,
		ContextMenuItemSubmenu,
		ContextMenuSection,
		KebabButton,
		TestId,
	} from "@gitbutler/ui";
	import type { AnchorPosition } from "$lib/stacks/stack";
	import { t } from "$lib/i18n/index.svelte";

	type Props = {
		showOnHover?: boolean;
		projectId: string;
		openId?: string;
		rightClickTrigger?: HTMLElement;
		contextData: CommitContextData | undefined;
	};

	let {
		showOnHover,
		projectId,
		openId = $bindable(),
		rightClickTrigger,
		contextData,
	}: Props = $props();

	const urlService = inject(URL_SERVICE);
	const stackService = inject(STACK_SERVICE);
	const clipboardService = inject(CLIPBOARD_SERVICE);
	const modeService = injectOptional(MODE_SERVICE, undefined);
	const diffService = inject(DIFF_SERVICE);
	const ircApiService = inject(IRC_API_SERVICE);
	const projectsService = inject(PROJECTS_SERVICE);
	const [insertBlankCommitInBranch, commitInsertion] = stackService.insertBlankCommit.useMutation();
	const [createRef, refCreation] = stackService.createReference;

	const projectQuery = $derived(projectsService.getProject(projectId));
	const projectTitle = $derived(projectQuery.response?.title ?? projectId);

	let sending = $state(false);

	// Component is read-only when stackId is undefined
	const isReadOnly = $derived(
		contextData?.commitStatus === "LocalAndRemote" || contextData?.commitStatus === "LocalOnly"
			? !contextData.stackId
			: false,
	);

	async function insertBlankCommit(commitId: string, location: "above" | "below" = "below") {
		await insertBlankCommitInBranch({
			projectId,
			relativeTo: { type: "commit", subject: commitId },
			side: location,
			dryRun: false,
		});
	}

	async function handleCreateNewRef(
		stackId: string | undefined,
		commitId: string,
		position: AnchorPosition,
	) {
		const newName = await stackService.fetchNewBranchName(projectId);
		await createRef({
			projectId,
			stackId,
			request: {
				newName,
				anchor: {
					type: "atCommit",
					subject: {
						commit_id: commitId,
						position,
					},
				},
			},
		});
	}

	async function handleEditPatch(commitId: string, stackId: string) {
		if (isReadOnly) return;
		await editPatch({
			modeService,
			commitId,
			stackId,
			projectId,
		});
	}

	async function sendCommitToChannel(
		channelName: string,
		commitId: string,
		commitMessage: string,
		stackId: string,
	) {
		if (sending) return;
		sending = true;
		try {
			const payload = await buildSharedCommitPayload(
				stackId,
				commitId,
				projectId,
				projectTitle,
				stackService,
				diffService,
			);
			const msg = Messages.sharedCommit({ sender: "me", commit: payload });
			const { text, data } = serialize(msg);
			await ircApiService.sendMessageWithData({
				target: channelName,
				message: text,
				data,
			});
		} finally {
			sending = false;
		}
	}
</script>

{#if contextData}
	<KebabButton
		{showOnHover}
		contextElement={rightClickTrigger}
		testId={TestId.KebabMenuButton}
		contextMenuTestId={TestId.CommitRowContextMenu}
	>
		{#snippet contextMenu({ close })}
			{@const { commitId, commitUrl, commitMessage } = contextData}
			{@const isLocal =
				contextData.commitStatus === "LocalAndRemote" || contextData.commitStatus === "LocalOnly"}
			{@const multiSelect = isLocal ? contextData.multiSelect : undefined}
			{@const isMultiSelect = multiSelect && multiSelect.commitIds.length > 1}

			{#if isLocal}
				{#if isMultiSelect}
					<!-- Multi-select actions -->
					<ContextMenuSection>
						<ContextMenuItem
							label={t('commit.contextMenu.squashCommits', { count: multiSelect.commitIds.length })}
							icon="commit-double-chevron-down"
							testId={TestId.CommitRowContextMenu_SquashSelected}
							disabled={isReadOnly}
							onclick={() => {
								if (!isReadOnly) {
									multiSelect.onSquashSelected();
									close();
								}
							}}
						/>
						<ContextMenuItem
							label={t('commit.contextMenu.uncommitCommits', { count: multiSelect.commitIds.length })}
							icon="undo"
							testId={TestId.CommitRowContextMenu_UncommitSelected}
							disabled={isReadOnly}
							onclick={() => {
								if (!isReadOnly) {
									multiSelect.onUncommitSelected();
									close();
								}
							}}
						/>
					</ContextMenuSection>
				{:else}
					<!-- Single-commit actions -->
					{@const { onUncommitClick, onEditMessageClick } = contextData}
					<ContextMenuSection>
						<ContextMenuItem
							label={t('commit.contextMenu.uncommit')}
							icon="undo"
							testId={TestId.CommitRowContextMenu_UncommitMenuButton}
							disabled={isReadOnly}
							onclick={(e: MouseEvent) => {
								if (!isReadOnly) {
									onUncommitClick?.(e);
									close();
								}
							}}
						/>
						<ContextMenuItem
							label={t('commit.contextMenu.reword')}
							icon="edit"
							testId={TestId.CommitRowContextMenu_EditMessageMenuButton}
							disabled={isReadOnly}
							onclick={(e: MouseEvent) => {
								if (!isReadOnly) {
									onEditMessageClick?.(e);
									close();
								}
							}}
						/>
						<ContextMenuItem
							label={t('commit.contextMenu.editCommit')}
							icon="commit-edit"
							testId={TestId.CommitRowContextMenu_EditCommit}
							disabled={isReadOnly}
							onclick={async () => {
								if (!isReadOnly && contextData.stackId) {
									await handleEditPatch(commitId, contextData.stackId);
									close();
								}
							}}
						/>
					</ContextMenuSection>
				{/if}
			{/if}

			{#if !isMultiSelect}
				<ContextMenuSection>
					{#if commitUrl}
						<ContextMenuItem
							label={t('commit.contextMenu.openInBrowser')}
							icon="open-in-browser"
							onclick={async () => {
								await urlService.openExternalUrl(commitUrl);
								close();
							}}
						/>
					{/if}
					<ContextMenuItemSubmenu label={t('commit.contextMenu.copy')} icon="copy">
						{#snippet submenu({ close: closeSubmenu })}
							<ContextMenuSection>
								{#if commitUrl}
									<ContextMenuItem
										label={t('commit.contextMenu.copyCommitLink')}
										onclick={() => {
											clipboardService.write(commitUrl, { message: t('commit.contextMenu.linkCopied') });
											closeSubmenu();
											close();
										}}
									/>
								{/if}
								<ContextMenuItem
									label={t('commit.contextMenu.copyCommitHash')}
									onclick={() => {
										clipboardService.write(commitId, { message: t('commit.contextMenu.hashCopied') });
										closeSubmenu();
										close();
									}}
								/>
								<ContextMenuItem
									label={t('commit.contextMenu.copyCommitMessage')}
									onclick={() => {
										clipboardService.write(commitMessage, { message: t('commit.contextMenu.messageCopied') });
										closeSubmenu();
										close();
									}}
								/>
							</ContextMenuSection>
						{/snippet}
					</ContextMenuItemSubmenu>
					{#if isLocal}
						{@const stackId = contextData.stackId}

						<ContextMenuItemSubmenu label={t('commit.contextMenu.addEmptyCommit')} icon="commit-plus">
							{#snippet submenu({ close: closeSubmenu })}
								<ContextMenuSection>
									<ContextMenuItem
										label={t('commit.contextMenu.addEmptyCommitAbove')}
										disabled={isReadOnly || commitInsertion.current.isLoading}
										onclick={() => {
											insertBlankCommit(commitId, "above");
											closeSubmenu();
											close();
										}}
									/>
									<ContextMenuItem
										label={t('commit.contextMenu.addEmptyCommitBelow')}
										disabled={isReadOnly || commitInsertion.current.isLoading}
										onclick={() => {
											insertBlankCommit(commitId, "below");
											closeSubmenu();
											close();
										}}
									/>
								</ContextMenuSection>
							{/snippet}
						</ContextMenuItemSubmenu>
						<ContextMenuItemSubmenu label={t('commit.contextMenu.createBranch')} icon="branch">
							{#snippet submenu({ close: closeSubmenu })}
								<ContextMenuSection>
									<ContextMenuItem
										label={t('commit.contextMenu.addBranchAbove')}
										disabled={isReadOnly || refCreation.current.isLoading}
										onclick={async () => {
											if (!isReadOnly) {
												await handleCreateNewRef(stackId, commitId, "Above");
												closeSubmenu();
												close();
											}
										}}
									/>
									<ContextMenuItem
										label={t('commit.contextMenu.addBranchBelow')}
										disabled={isReadOnly || refCreation.current.isLoading}
										onclick={async () => {
											if (!isReadOnly) {
												await handleCreateNewRef(stackId, commitId, "Below");
												closeSubmenu();
												close();
											}
										}}
									/>
								</ContextMenuSection>
							{/snippet}
						</ContextMenuItemSubmenu>
					{/if}
				</ContextMenuSection>

				{#if "stackId" in contextData && contextData.stackId}
					{@const ctxStackId = contextData.stackId}
					<IrcSendToSubmenus
						{projectId}
						disabled={sending}
						onSend={(target) => sendCommitToChannel(target, commitId, commitMessage, ctxStackId)}
						closeMenu={close}
					/>
				{/if}

				<ContextMenuSection>
					<ContextMenuItem
						label={$rewrapCommitMessage ? t('commit.contextMenu.showOriginalWrapping') : t('commit.contextMenu.rewrapMessage')}
						icon="text-wrap"
						disabled={commitInsertion.current.isLoading}
						onclick={() => {
							rewrapCommitMessage.set(!$rewrapCommitMessage);
							close();
						}}
					/>
				</ContextMenuSection>
			{/if}
		{/snippet}
	</KebabButton>
{/if}
