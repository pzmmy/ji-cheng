<!--
  SSH 密钥管理组件
  用途: 自动检测本地 SSH 公钥（id_rsa / id_ed25519 / id_ecdsa），提供复制和添加到 Gitee/GitHub 的功能
  流程: 挂载时自动检测 → 显示密钥内容或引导用户生成密钥
-->
<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { inject } from "@gitbutler/core/context";
	import { BACKEND } from "$lib/backend";
	import { Button, CardGroup, InfoMessage } from "@gitbutler/ui";
	import { onMount } from "svelte";

	const backend = inject(BACKEND);

	let sshKeyFound = $state(false);
	let sshKeyContent = $state("");
	let loading = $state(true);
	let copied = $state(false);

	onMount(() => {
		detectSshKey();
	});

	async function detectSshKey() {
		loading = true;
		sshKeyFound = false;
		sshKeyContent = "";
		copied = false;

		try {
			const homeDir = await backend.homeDirectory();
			const keyNames = ["id_rsa.pub", "id_ed25519.pub", "id_ecdsa.pub"];

			for (const keyName of keyNames) {
				const keyPath = await backend.joinPath(homeDir, ".ssh", keyName);
				try {
					const data = await backend.readFile(keyPath);
					const content = new TextDecoder().decode(data);
					if (content && content.trim()) {
						sshKeyContent = content.trim();
						sshKeyFound = true;
						break;
					}
				} catch {
					// File not found, try next key
					continue;
				}
			}
		} catch {
			// Home directory not available
		} finally {
			loading = false;
		}
	}

	async function handleCopyKey() {
		if (!sshKeyContent) return;
		try {
			await navigator.clipboard.writeText(sshKeyContent);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard API not available
		}
	}

	function openGiteeSshKeys() {
		window.open("https://gitee.com/profile/sshkeys", "_blank");
	}

	function openGithubSshKeys() {
		window.open("https://github.com/settings/keys", "_blank");
	}

	const isWindows = $derived(backend.platformName === "windows");
</script>

<div class="ssh-key-section">
	<CardGroup>
		<CardGroup.Item>
			{#snippet title()}
				{t("settings.sshKeys")}
			{/snippet}
			{#snippet caption()}
				{t("settings.sshKeysDesc")}
			{/snippet}

			{#if loading}
				<div class="ssh-key-loading">{t("common.loading")}</div>
			{:else if !sshKeyFound}
				<InfoMessage style="info">
					{#snippet title()}
						{t("settings.sshKeyNotFound")}
					{/snippet}
					{#snippet content()}
						<ol class="ssh-key-steps">
							<li>{t("settings.sshKeyGenerateStep1")}</li>
							<li>
								{#if isWindows}
									{t("settings.sshKeyGenerateStep2a")}
								{:else}
									{t("settings.sshKeyGenerateStep2b")}
								{/if}
								<code class="ssh-key-command">ssh-keygen -t rsa -b 4096 -C "your_email@example.com"</code>
							</li>
							<li>{t("settings.sshKeyGenerateStep3")}</li>
						</ol>
					{/snippet}
				</InfoMessage>
			{:else}
				<div class="ssh-key-success">
					<InfoMessage style="success">
						{#snippet title()}
							{t("settings.sshKeyFound")}
						{/snippet}
					</InfoMessage>

					<div class="ssh-key-display">
						<code class="ssh-key-content">{sshKeyContent}</code>
					</div>

					<div class="ssh-key-actions">
						<Button style="pop" onclick={handleCopyKey}>
							{copied ? t("settings.sshKeyCopied") : t("settings.sshKeyCopy")}
						</Button>
						<Button style="pop" kind="outline" onclick={openGiteeSshKeys}>
							{t("settings.sshKeyAddToGitee")}
						</Button>
						<Button style="pop" kind="outline" onclick={openGithubSshKeys}>
							{t("settings.sshKeyAddToGithub")}
						</Button>
					</div>
				</div>
			{/if}
		</CardGroup.Item>
	</CardGroup>
</div>

<style lang="postcss">
	.ssh-key-section {
		margin-top: 8px;
	}

	.ssh-key-loading {
		padding: 8px 0;
		font-size: 12px;
		opacity: 0.6;
	}

	.ssh-key-steps {
		margin: 0;
		padding: 0 0 0 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.ssh-key-command {
		display: block;
		margin-top: 4px;
		padding: 6px 10px;
		background-color: var(--bg-2);
		border-radius: var(--radius-s);
		font-family: var(--font-mono);
		font-size: 12px;
		white-space: pre-wrap;
		word-break: break-all;
		user-select: all;
	}

	.ssh-key-success {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}

	.ssh-key-display {
		max-height: 160px;
		overflow-y: auto;
		padding: 10px;
		background-color: var(--bg-2);
		border-radius: var(--radius-s);
		border: 1px solid var(--border-2);
	}

	.ssh-key-content {
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-all;
		user-select: all;
		color: var(--text-2);
	}

	.ssh-key-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
</style>
