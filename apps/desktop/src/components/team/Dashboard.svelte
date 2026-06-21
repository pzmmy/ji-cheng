<!--
  团队面板组件
  用途: 显示团队协作概览，包括 PR 统计卡片（开放 PR、本周审查、平均响应时间、总 PR 数）
  数据来源: 通过 gitService 和 projectsService 注入，当前为占位数据
-->
<script lang="ts">
	import { goto } from "$app/navigation";
	import { CardGroup, Button, Icon } from "@gitbutler/ui";
	import { t } from "$lib/i18n/index.svelte";
	import { inject } from "@gitbutler/core/context";
	import { GIT_SERVICE } from "$lib/git/gitService";
	import { PROJECTS_SERVICE } from "$lib/project/projectsService";

	interface ReviewStat {
		label: string;
		value: number | string;
		icon: string;
		color: string;
	}

	const gitService = inject(GIT_SERVICE);
	const projectsService = inject(PROJECTS_SERVICE);

	let stats = $state<ReviewStat[]>([
		{ label: t('team.stats.openPrs'), value: "--", icon: "git-pull-request", color: "var(--text-1)" },
		{ label: t('team.stats.reviewsThisWeek'), value: "--", icon: "check", color: "var(--color-green)" },
		{ label: t('team.stats.avgResponseTime'), value: "--", icon: "clock", color: "var(--text-2)" },
		{ label: t('team.stats.totalPrs'), value: "--", icon: "repo", color: "var(--text-1)" },
	]);

	async function refreshStats() {
		// Placeholder: stats will be computed from PR data
		stats[0].value = "0";
		stats[1].value = "0";
		stats[2].value = "0h";
		stats[3].value = "0";
	}
</script>

<div class="team-dashboard">
	<h2 class="dashboard-title text-serif-28">{t('team.dashboard.title')}</h2>
	<p class="dashboard-desc text-14">{t('team.dashboard.description')}</p>

	<div class="stats-grid">
		{#each stats as stat}
			<div class="stat-card" style="--stat-color: {stat.color}">
				<div class="stat-icon">
					<Icon name={stat.icon} size={24} />
				</div>
				<div class="stat-value">{stat.value}</div>
				<div class="stat-label text-13">{stat.label}</div>
			</div>
		{/each}
	</div>

	<div class="dashboard-actions">
		<Button onclick={refreshStats} icon="refresh">
			{t('common.refresh')}
		</Button>
	</div>
</div>

<style lang="postcss">
	.team-dashboard {
		padding: 24px 0;
	}

	.dashboard-title {
		color: var(--text-1);
		margin-bottom: 4px;
	}

	.dashboard-desc {
		color: var(--text-2);
		margin-bottom: 24px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 24px;
	}

	.stat-card {
		background: var(--bg-mute);
		border-radius: var(--radius-m);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: center;
		text-align: center;
	}

	.stat-icon {
		opacity: 0.7;
	}

	.stat-value {
		font-size: 32px;
		font-weight: 700;
		color: var(--stat-color);
		line-height: 1;
	}

	.stat-label {
		color: var(--text-2);
	}

	.dashboard-actions {
		display: flex;
		gap: 8px;
	}
</style>
