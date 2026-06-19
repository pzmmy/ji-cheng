<script lang="ts">
	import GiteeAccountBadge from "$components/settings/GiteeAccountBadge.svelte";
	import ReduxResult from "$components/shared/ReduxResult.svelte";
	import { GITEE_USER_SERVICE, type GiteeAccountIdentifier } from "$lib/forge/gitee/giteeUserService.svelte";
	import { inject } from "@gitbutler/core/context";
	import { ForgeUserCard } from "@gitbutler/ui";
	import { QueryStatus } from "@reduxjs/toolkit/query";

	type Props = {
		account: GiteeAccountIdentifier;
	};

	const { account }: Props = $props();

	const giteeUserService = inject(GITEE_USER_SERVICE);

	const [forget, forgetting] = giteeUserService.forgetGiteeAccount;
	const geUser = $derived(giteeUserService.authenticatedUser(account));

	const isError = $derived(geUser.result?.status === QueryStatus.rejected);
	const isLoading = $derived(geUser.result?.status === QueryStatus.pending);

	const username = $derived(account.info.username);
</script>

<ReduxResult result={geUser.result}>
	{#snippet loading()}
		<ForgeUserCard
			{username}
			avatarUrl={null}
			isError={false}
			isLoading={true}
			onForget={() => forget(account)}
			isForgetLoading={forgetting.current.isLoading}
		>
			{#snippet badge()}
				<GiteeAccountBadge {account} />
			{/snippet}
		</ForgeUserCard>
	{/snippet}
	{#snippet error()}
		<ForgeUserCard
			{username}
			avatarUrl={null}
			isError={true}
			isLoading={false}
			onForget={() => forget(account)}
			isForgetLoading={forgetting.current.isLoading}
		>
			{#snippet badge()}
				<GiteeAccountBadge {account} />
			{/snippet}
		</ForgeUserCard>
	{/snippet}
	{#snippet children(user)}
		<ForgeUserCard
			{username}
			avatarUrl={user?.avatarUrl ?? null}
			email={user?.email}
			{isError}
			{isLoading}
			onForget={() => forget(account)}
			isForgetLoading={forgetting.current.isLoading}
		>
			{#snippet badge()}
				<GiteeAccountBadge {account} />
			{/snippet}
		</ForgeUserCard>
	{/snippet}
</ReduxResult>
