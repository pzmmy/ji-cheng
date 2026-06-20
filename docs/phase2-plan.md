## Phase 2 实施方案

### 1. Gitee Code Review（PR 评论系统）

**Rust 后端**（在但-gitee/src/client.rs 添加）：
- `list_pr_comments(owner, repo, number)` → GET /repos/{owner}/{repo}/pulls/{number}/comments
- `create_pr_comment(owner, repo, number, body)` → POST /repos/{owner}/{repo}/pulls/{number}/comments
- `list_pr_reviews(owner, repo, number)` → GET /repos/{owner}/{repo}/pulls/{number}/reviews
- 新建 `crates/but-gitee/src/review.rs`（Review 相关类型）

**前端**：
- 在 `GiteeIssuePanel.svelte` 或新建 `GiteeReviewPanel.svelte` 中展示 PR 评论
- 利用现有 `ReviewCreation.svelte` 等上游组件

### 2. GitHub → Gitee 镜像

**Shell 脚本**（`scripts/mirror-to-gitee.sh`）：
- `git clone --mirror` 从 GitHub
- `git remote add gitee`
- `git push --mirror` 到 Gitee

**前端**：
- 设置页添加镜像配置（GitHub URL + Gitee 仓库路径）
- 一键执行按钮

### 3. AI Code Review

**Prompt 模板**（在 prompts-zh.ts 添加）：
- `ZH_AI_REVIEW_PROMPT`：发送 git diff 给 DeepSeek，返回评审意见
- 格式：文件级别的问题列表 + 🔴🟡🟢 严重等级

**前端**：
- 在 PR 详情页添加「AI 审查」按钮
- 展示审查结果（分级问题列表）
