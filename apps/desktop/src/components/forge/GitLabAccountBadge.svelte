<script lang="ts">
	import { Badge } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";
	import type { GitlabAccountIdentifier } from "@gitbutler/but-sdk";

	type Props = {
		account: GitlabAccountIdentifier;
		class?: string;
	};

	const { account, class: className }: Props = $props();

	export function badgeText(account: GitlabAccountIdentifier): string | null {
		switch (account.type) {
			case "patUsername":
				return "PAT";
			case "selfHosted":
				return account.info.host;
		}
	}

	export function tooltipText(account: GitlabAccountIdentifier): string {
		switch (account.type) {
			case "patUsername":
				return t('forge.gitlabAccountBadge.pat');
			case "selfHosted":
				return t('forge.gitlabAccountBadge.selfHosted');
		}
	}
</script>

<Badge class={className} tooltip={tooltipText(account)}>
	{badgeText(account)}
</Badge>
