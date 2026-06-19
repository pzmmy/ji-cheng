# Gitee 集成功能差距分析

## A. ForgeReview 结构体缺失字段

当前 `ForgeReview` 结构体定义于 `crates/but-forge/src/review.rs`（第335-382行）。Gitee 的转换实现（`impl From<but_gitee::GiteePr> for ForgeReview`，第238-264行）有以下字段硬编码为固定值或空值，而 GitHub/GitLab 版本则从 API 响应中填充：

| 字段 | Gitee 当前值 | GitHub 状态 | GitLab 状态 |
|------|-------------|-------------|-------------|
| `repository_ssh_url` | `None` | 从 API 填充 | `None` |
| `repository_https_url` | `None` | 从 API 填充 | `None` |
| `repo_owner` | `None` | 从 API 填充 | `None` |
| `head_repo_is_fork` | `false` | 从 API 填充 | `false` |
| `reviewers` | `vec![]` | 从 `requested_reviewers` 填充 | 从 `reviewers` 填充 |

**分析**：`GiteePrBranch` 结构体已有 `repo` 字段（`GiteePrRepo`，包含 `full_name`, `clone_url`, `owner`），所以 Gitee 理论上可以从 API 响应中填充 `repository_ssh_url`、`repository_https_url`、`repo_owner` 和 `head_repo_is_fork`。`reviewers` 字段需要额外的 API 调用获取。

---

## B. 已 Stubbed / 未实现的 Gitee 操作清单

以下操作在 `crates/but-forge/src/review.rs` 中为 Gitee 返回错误，而 GitHub 和 GitLab 有完整实现：

### 1. get_review_merge_status（第1057-1059行）
```
Gitee => Err("Merge status for forge Gitee is not implemented yet.")
```
**Gitee API**: `GET /api/v5/repos/{owner}/{repo}/pulls/{number}` — 响应中包含 `merge_status` 字段（"can_merge"、"cannot_merge"、"conflict" 等）

### 2. update_review（第1186-1188行）
```
Gitee => Err("Updating reviews for forge Gitee is not implemented yet.")
```
**Gitee API**: `PATCH /api/v5/repos/{owner}/{repo}/pulls/{number}`
- 支持更新：title、body、base（目标分支）、state（open/closed）
- 请求体：`{"title": "...", "body": "...", "base": "...", "state": "open|closed"}`

### 3. merge_review（第1263-1265行）
```
Gitee => Err("Merging reviews for forge Gitee is not implemented yet.")
```
**Gitee API**: `PUT /api/v5/repos/{owner}/{repo}/pulls/{number}/merge`
- 参数：`merge_message`（可选）、`prune_source_branch`（可选，布尔值）
- Gitee 不支持 GitHub 的 merge/squash/rebase 策略选择 — 默认使用合并

### 4. set_review_auto_merge_state（第1311-1313行）
```
Gitee => Err("Setting the auto-merge state of reviews for forge Gitee is not implemented yet.")
```
**Gitee API**: **不支持**。Gitee 没有自动合并功能。

### 5. set_review_draftiness（第1359-1361行）
```
Gitee => Err("Setting the draftiness of reviews for forge Gitee is not implemented yet.")
```
**Gitee API**: **不支持**。Gitee 的 PR 没有"草稿"状态。当前 `create_pull_request` 实现也没有传递 `draft` 参数。

### 6. CI Checks（`crates/but-forge/src/ci.rs`，第78-81行）
```
_ => Err("Listing ci checks for forge Gitee is not implemented yet.")
```
**Gitee API**: `GET /api/v5/repos/{owner}/{repo}/commits/{ref}/status` — 获取提交状态检查。不如 GitHub Checks API 完善，但可通过状态 API 实现基础功能。

### 7. check_forge_account_is_valid（review.rs，第615-618行）
```
_ => Err("Checking reviews for forge Gitee is not implemented yet.")
```
**当前状态**：Gitee 账户未在该验证流程中。但 Gitee 本身有 `crate::check_credentials()` 函数可用。

### 8. Review 模板
**当前状态**：`get_review_template_functions`（review.rs 第81-112行）没有 `ForgeName::Gitee` 分支。Gitee 习惯使用 `.gitee` 目录（类似 GitHub 的 `.github`/`PULL_REQUEST_TEMPLATE` 和 GitLab 的 `.gitlab`/`merge_request_templates`）。

---

## C. 需要实现的 Gitee API Endpoints 清单

### PR 操作

| 操作 | Gitee API v5 Endpoint | 方法 | 说明 |
|------|----------------------|------|------|
| 列出 PR | `/api/v5/repos/{owner}/{repo}/pulls` | GET | ✅ 已实现（list_open_prs, list_prs_for_target） |
| 获取单个 PR | `/api/v5/repos/{owner}/{repo}/pulls/{number}` | GET | ✅ 已实现（get_pull_request） |
| 创建 PR | `/api/v5/repos/{owner}/{repo}/pulls` | POST | ✅ 已实现（create_pull_request） |
| **更新 PR** | `/api/v5/repos/{owner}/{repo}/pulls/{number}` | PATCH | ❌ 未实现 |
| **合并 PR** | `/api/v5/repos/{owner}/{repo}/pulls/{number}/merge` | PUT | ❌ 未实现 |
| 获取合并状态 | `/api/v5/repos/{owner}/{repo}/pulls/{number}` | GET | ❌ 未实现（已有 get_pull_request，需要解析 merge_status 字段） |
| **列出 PR 评论** | `/api/v5/repos/{owner}/{repo}/pulls/{number}/comments` | GET | ❌ 未实现 |
| **创建 PR 评论/审查** | `/api/v5/repos/{owner}/{repo}/pulls/{number}/reviews` | POST | ❌ 未实现 |

### Label 操作

| 操作 | Gitee API v5 Endpoint | 方法 | 说明 |
|------|----------------------|------|------|
| **列出仓库标签** | `/api/v5/repos/{owner}/{repo}/labels` | GET | ❌ 未实现 |
| **给 PR 添加标签** | `/api/v5/repos/{owner}/{repo}/pulls/{number}/labels` | POST | ❌ 未实现 |
| **删除 PR 标签** | `/api/v5/repos/{owner}/{repo}/pulls/{number}/labels/{labelId}` | DELETE | ❌ 未实现 |

### 仓库/用户操作

| 操作 | Gitee API v5 Endpoint | 方法 | 说明 |
|------|----------------------|------|------|
| 获取认证用户 | `/api/v5/user` | GET | ✅ 已实现（get_user, get_authenticated） |
| 获取仓库信息 | `/api/v5/repos/{owner}/{repo}` | GET | ✅ 已实现（get_project） |
| **PR 提交状态/CI** | `/api/v5/repos/{owner}/{repo}/commits/{ref}/status` | GET | ❌ 未实现 |

---

## D. 前端 UI 缺失功能

### 1. Gitee 设置面板完全缺失
- **缺少 `GiteeIntegration.svelte`** — `IntegrationsSettings.svelte`（`apps/desktop/src/components/settings/IntegrationsSettings.svelte`）只导入并展示了 `GithubIntegration` 和 `GitlabIntegration`，没有 Gitee 对应组件
- **缺少 `giteeUserService.svelte.ts`** — GitHub 有 `githubUserService.svelte.ts`，GitLab 有 `gitlabUserService.svelte.ts`，Gitee 没有对应的前端用户服务
- **缺少 `GiteeUserLoginState.svelte`** — GitHub 和 GitLab 都有显示用户登录状态的组件

### 2. Gitee 前端 hooks 不完整
- `apps/desktop/src/lib/forge/gitee/hooks.svelte.ts` 的 `useGiteeAccessToken()` 方法始终返回 `undefined` 作为 accessToken（第61行），因为它没有像 GitHub/GitLab hooks 那样调用一个实际的 userService
- 对比：GitHub hooks 调用 `githubUserService.authenticatedUser(account)` 获取 token

### 3. 前端 forge 功能差异（可通过 `ForgeCapabilities` 控制）

当前 `ForgeCapabilities`（`forge_info.rs` 第201-206行）声明 Gitee 支持：
- `checks: false`
- `repo_info: true` ✅
- `pr_service: true`
- `list_service: true`

但实际上部分声明为 true 的功能在操作时会报错（如 pr_service 中的 merge_review 返回错误）。

---

## E. 高级功能实现优先级建议

### 第一优先级（基础 PR 操作闭环）
1. **合并 PR** — 最常用操作，调用 `PUT /api/v5/repos/{owner}/{repo}/pulls/{number}/merge`
2. **获取合并状态** — `GET /api/v5/repos/{owner}/{repo}/pulls/{number}` 的 merge_status 字段
3. **更新 PR** — `PATCH /api/v5/repos/{owner}/{repo}/pulls/{number}`（更新 title/body/target）

### 第二优先级（填补 ForgeReview 数据）
4. **填充 reviewers** — 从 PR API 获取审查人员信息
5. **填充 repo_owner / head_repo_is_fork** — 从 `GiteePrBranch.repo` 中提取
6. **填充 repository_ssh_url / repository_https_url** — 同上

### 第三优先级（增强功能）
7. **Label 操作** — 添加/删除 PR 标签
8. **PR 评论/Code Review** — `POST /api/v5/repos/{owner}/{repo}/pulls/{number}/reviews`
9. **提交状态/CI** — `GET /api/v5/repos/{owner}/{repo}/commits/{ref}/status`
10. **Review 模板** — 支持 `.gitee/PULL_REQUEST_TEMPLATE/` 模板目录

### 不可行（Gitee 不支持）
- **自动合并（Auto-merge）** — Gitee 无此功能
- **草稿状态切换（Set draftiness）** — Gitee 无 draft PR 概念（创建时可以通过特定方式标记，但切换无 API）

### 前端
11. **GiteeIntegration.svelte** — 设置面板中的 Gitee 配置入口（PAT 输入+账户管理）
12. **giteeUserService.svelte.ts** — 前端 Gitee 用户服务
