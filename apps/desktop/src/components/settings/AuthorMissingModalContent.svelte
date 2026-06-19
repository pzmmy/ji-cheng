<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { GIT_SERVICE } from "$lib/git/gitService";
	import { inject } from "@gitbutler/core/context";
	import { TestId, ModalHeader, ModalFooter, Textbox, EmailTextbox, Button } from "@gitbutler/ui";
	import { untrack } from "svelte";
	import type { AuthorMissingModalState } from "$lib/state/uiState.svelte";

	type Props = {
		data: AuthorMissingModalState;
		close: () => void;
	};

	const { data, close }: Props = $props();

	const gitService = inject(GIT_SERVICE);
	const [setAuthorInfo, settingInfo] = gitService.setAuthorInfo;

	let name = $state(untrack(() => data.authorName));
	let email = $state(untrack(() => data.authorEmail));
	let emailTextbox: any;

	async function handleSubmit() {
		if (!name || !email) {
			return;
		}
		if (!emailTextbox.isValid()) {
			emailTextbox.validate();
			return;
		}
		await setAuthorInfo({
			projectId: data.projectId,
			name,
			email,
		});
		close();
	}
</script>

<ModalHeader type="warning">{t('settings.authorMissing.title')}</ModalHeader>
<div class="author-missing__content">
	{t('settings.authorMissing.description')}

	<Textbox
		disabled={settingInfo.current.isLoading}
		placeholder={t('settings.authorMissing.namePlaceholder')}
		label={t('settings.authorMissing.nameLabel')}
		testId={TestId.GlobalModal_AuthorMissing_NameInput}
		bind:value={name}
		autofocus
	/>

	<EmailTextbox
		disabled={settingInfo.current.isLoading}
		placeholder={t('settings.authorMissing.emailPlaceholder')}
		label={t('settings.authorMissing.emailLabel')}
		testId={TestId.GlobalModal_AuthorMissing_EmailInput}
		bind:value={email}
		bind:this={emailTextbox}
	/>
</div>
<ModalFooter>
	<Button kind="outline" onclick={close} disabled={settingInfo.current.isLoading}>{t('common.cancel')}</Button>
	<Button
		testId={TestId.GlobalModal_AuthorMissing_ActionButton}
		style="pop"
		onclick={handleSubmit}
		loading={settingInfo.current.isLoading}
		disabled={!name || !email}
	>
		{settingInfo.current.isLoading ? t('settings.authorMissing.saving') : t('settings.authorMissing.saveAndContinue')}
	</Button>
</ModalFooter>

<style lang="postcss">
	.author-missing__content {
		display: flex;
		flex-direction: column;
		padding: 0 16px 16px 16px;
		gap: 16px;
	}
</style>
