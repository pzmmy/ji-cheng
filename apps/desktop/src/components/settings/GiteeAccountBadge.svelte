<script lang="ts">
	import { Badge } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";
	import type { GiteeAccountIdentifier } from "$lib/forge/gitee/giteeUserService.svelte";

	type Props = {
		account: GiteeAccountIdentifier;
		class?: string;
	};

	const { account, class: className }: Props = $props();

	export function badgeText(account: GiteeAccountIdentifier): string | null {
		switch (account.type) {
			case "patUsername":
				return "PAT";
		}
	}

	export function tooltipText(account: GiteeAccountIdentifier): string {
		switch (account.type) {
			case "patUsername":
				return t('forge.giteeAccountBadge.pat');
		}
	}
</script>

<Badge class={className} tooltip={tooltipText(account)}>
	{badgeText(account)}
</Badge>
