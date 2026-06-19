<script lang="ts">
	import { USER_SERVICE } from "$lib/user/userService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { Button, ModalHeader, ModalFooter, SkeletonBone } from "@gitbutler/ui";
	import { gravatarUrlFromEmail } from "@gitbutler/ui/components/avatar/gravatar";
	import type { LoginConfirmationModalState } from "$lib/state/uiState.svelte";
	import { t } from "$lib/i18n/index.svelte";

	type Props = {
		data: LoginConfirmationModalState;
		close: () => void;
	};

	const { close }: Props = $props();

	const userService = inject(USER_SERVICE);
	const incomingUserEmail = $derived(userService.incomingUserLogin?.email);
	const incomingUserName = $derived(
		userService.incomingUserLogin?.login ??
			userService.incomingUserLogin?.name ??
			incomingUserEmail ??
			"unknown",
	);
	const incomingUserAvatarUrl = $derived(userService.incomingUserLogin?.picture);

	async function getUserAvatarURL(): Promise<string | null> {
		if (incomingUserAvatarUrl) return incomingUserAvatarUrl;
		if (incomingUserEmail) {
			const gravatarUrl = await gravatarUrlFromEmail(incomingUserEmail);
			return gravatarUrl;
		}
		return null;
	}

	function acceptLogin() {
		if (userService.incomingUserLogin) {
			userService.acceptIncomingUser(userService.incomingUserLogin);
		}
		close();
	}

	function rejectLogin() {
		userService.rejectIncomingUser();
		close();
	}

	const avatarSize = "3.25rem";
</script>

<ModalHeader type="info">{t('onboarding.login.confirmLogin', { name: incomingUserName })}</ModalHeader>
<div class="modal-content">
	{#await getUserAvatarURL()}
		<SkeletonBone width={avatarSize} height={avatarSize} radius="100%" />
	{:then url}
		<img src={url} alt="" class="login-avatar" style:height={avatarSize} style:width={avatarSize} />
	{/await}

	<p class="text-13 text-body clr-text-2">
		{t('onboarding.login.detectedAttempt1')}
		<span class="text-bold clr-text-1">{incomingUserEmail ?? "-unknown-"}</span>
		{t('onboarding.login.detectedAttempt2')}
	</p>
</div>
<ModalFooter>
	<Button kind="outline" onclick={rejectLogin}>{t('onboarding.login.reject')}</Button>
	<Button style="pop" onclick={acceptLogin}>{t('onboarding.login.acceptLogin')}</Button>
</ModalFooter>

<style lang="postcss">
	.modal-content {
		display: flex;
		padding: 0 16px 16px 16px;
		gap: 16px;
	}

	.login-avatar {
		border-radius: 50%;
		background-color: var(--bg-2);
	}
</style>
