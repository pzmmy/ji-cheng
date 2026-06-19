<script lang="ts">
	import { t } from "$lib/i18n/index.svelte";
	import { PROMPT_SERVICE } from "$lib/prompt/promptService";
	import { inject } from "@gitbutler/core/context";
	import { Button, Modal, Textbox } from "@gitbutler/ui";

	const promptService = inject(PROMPT_SERVICE);
	const [prompt, error] = promptService.reactToPrompt({ timeoutMs: 30000 });

	let value = $state<string>("");
	let modal = $state<ReturnType<typeof Modal>>();
	let loading = $state(false);

	$effect(() => {
		if ($prompt && modal?.imports.open === false && !loading) {
			modal?.show();
		}
	});

	async function submit() {
		if (!$prompt) return;
		loading = true;
		try {
			await modal?.close();
			await $prompt.respond(value);
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
			clear();
		}
	}

	async function cancel() {
		try {
			if ($prompt) await $prompt.respond(null);
		} catch (err) {
			console.error(err);
		} finally {
			clear();
		}
	}

	async function handleCancelButton() {
		await modal?.close();
		await cancel();
	}

	function clear() {
		prompt.set(undefined);
		error.set(undefined);
		value = "";
	}
</script>

<Modal
	bind:this={modal}
	width="small"
	title={t('prompt.gitNeedsInput')}
	onClickOutside={cancel}
	onSubmit={submit}
>
	<div class="message">
		{#if $error}
			{$error}
		{:else}
			<code>{$prompt?.prompt}</code>
		{/if}
	</div>
	<Textbox autofocus type="password" bind:value disabled={!!$error || loading} />

	{#snippet controls()}
		<Button kind="outline" type="reset" disabled={loading} onclick={handleCancelButton}
			>{t('prompt.cancel')}</Button
		>
		<Button style="pop" type="submit" grow disabled={!!$error || loading} {loading}>{t('prompt.submit')}</Button>
	{/snippet}
</Modal>

<style lang="postcss">
	.message {
		padding-bottom: 12px;
	}
</style>
