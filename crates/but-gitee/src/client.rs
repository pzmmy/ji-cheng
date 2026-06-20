use anyhow::{Context, Result, bail};
use but_secret::Sensitive;
use reqwest::header::{ACCEPT, AUTHORIZATION, HeaderMap, HeaderValue, USER_AGENT};
use serde::{Deserialize, Serialize};

use crate::GiteeProjectId;

const GITEE_API_BASE_URL: &str = "https://gitee.com/api/v5";

/// An HTTP error with a status code, returned when the API responds with a non-success status.
#[derive(Debug, thiserror::Error)]
#[error("HTTP {status}")]
pub struct HttpStatusError {
    pub status: reqwest::StatusCode,
}

pub struct GiteeClient {
    client: reqwest::Client,
    base_url: String,
}

impl GiteeClient {
    pub fn new(access_token: &Sensitive<String>) -> Result<Self> {
        let mut headers = HeaderMap::new();
        headers.insert(
            USER_AGENT,
            HeaderValue::from_static("gb-gitee-integration"),
        );
        headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", access_token.0))?,
        );

        let client = reqwest::Client::builder()
            .default_headers(headers)
            .build()?;

        Ok(Self {
            client,
            base_url: GITEE_API_BASE_URL.to_string(),
        })
    }

    pub fn from_storage(
        storage: &but_forge_storage::Controller,
        preferred_account: Option<&crate::GiteeAccountIdentifier>,
    ) -> anyhow::Result<Self> {
        let account_id = resolve_account(preferred_account, storage)?;
        if let Some(access_token) = crate::token::get_gitee_access_token(&account_id, storage)? {
            Self::new(&access_token)
        } else {
            Err(anyhow::anyhow!(
                "No Gitee access token found for account '{account_id}'.\nRun 'but config forge auth' to re-authenticate."
            ))
        }
    }

    pub async fn get_authenticated(&self) -> Result<AuthenticatedUser> {
        #[derive(Deserialize)]
        struct User {
            login: String,
            name: Option<String>,
            email: Option<String>,
            avatar_url: Option<String>,
        }

        let url = format!("{}/user", self.base_url);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(HttpStatusError {
                status: response.status(),
            }
            .into());
        }

        let user: User = response.json().await?;

        Ok(AuthenticatedUser {
            username: user.login,
            avatar_url: user.avatar_url,
            name: user.name,
            email: user.email,
        })
    }

    pub async fn get_user(&self) -> Result<GiteeUser> {
        #[derive(Deserialize)]
        struct ApiUser {
            id: i64,
            login: String,
            name: Option<String>,
            #[serde(default)]
            email: Option<String>,
            avatar_url: Option<String>,
            #[serde(default)]
            bot: bool,
        }

        let url = format!("{}/user", self.base_url);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            return Err(HttpStatusError {
                status: response.status(),
            }
            .into());
        }

        let user: ApiUser = response.json().await?;

        Ok(GiteeUser {
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url,
            is_bot: user.bot,
        })
    }

    pub async fn get_project(&self, owner: &str, repo: &str) -> Result<GiteeProject> {
        #[derive(Deserialize)]
        struct ApiProject {
            id: i64,
            full_name: String,
            #[serde(default)]
            default_branch: Option<String>,
            #[serde(default)]
            parent: Option<ApiProjectRef>,
            #[serde(default)]
            permissions: Option<ApiPermissions>,
        }

        #[derive(Deserialize)]
        struct ApiProjectRef {
            id: i64,
        }

        #[derive(Deserialize)]
        struct ApiPermissions {
            #[serde(default)]
            admin: bool,
            #[serde(default)]
            push: bool,
            #[serde(default)]
            pull: bool,
        }

        let url = format!("{}/repos/{}/{}", self.base_url, owner, repo);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            bail!("Failed to fetch project: {status} - {error_text}");
        }

        let project: ApiProject = response.json().await?;

        Ok(GiteeProject {
            id: project.id,
            full_name: project.full_name,
            default_branch: project.default_branch,
            forked_from_project_id: project.parent.map(|p| p.id),
            permissions: project.permissions.map(|p| GiteeProjectPermissions {
                admin: p.admin,
                push: p.push,
                pull: p.pull,
            }),
        })
    }

    pub async fn list_open_prs(&self, owner: &str, repo: &str) -> Result<Vec<GiteePr>> {
        let url = format!("{}/repos/{}/{}/pulls", self.base_url, owner, repo);

        let response = self
            .client
            .get(&url)
            .query(&[("state", "open"), ("sort", "created_at")])
            .send()
            .await?;

        if !response.status().is_success() {
            bail!("Failed to list open pull requests: {}", response.status());
        }

        let prs: Vec<ApiPullRequest> = response.json().await?;
        Ok(prs.into_iter().map(Into::into).collect())
    }

    pub async fn list_prs_for_target(
        &self,
        owner: &str,
        repo: &str,
        target_branch: &str,
    ) -> Result<Vec<GiteePr>> {
        let url = format!("{}/repos/{}/{}/pulls", self.base_url, owner, repo);

        let response = self
            .client
            .get(&url)
            .query(&[
                ("state", "all"),
                ("sort", "updated_at"),
                ("direction", "desc"),
                ("per_page", "100"),
            ])
            .send()
            .await?;

        if !response.status().is_success() {
            bail!(
                "Failed to list pull requests for target branch: {}",
                response.status()
            );
        }

        let prs: Vec<ApiPullRequest> = response.json().await?;
        // Filter by target branch client-side since Gitee API doesn't support it server-side
        Ok(prs
            .into_iter()
            .filter(|pr| pr.base.label.contains(target_branch) || pr.base.ref_field == target_branch)
            .map(Into::into)
            .collect())
    }

    pub async fn create_pull_request(
        &self,
        params: &CreatePullRequestParams<'_>,
    ) -> Result<GiteePr> {
        #[derive(Serialize)]
        struct CreatePrBody<'a> {
            title: &'a str,
            head: &'a str,
            base: &'a str,
            #[serde(skip_serializing_if = "Option::is_none")]
            body: Option<&'a str>,
            #[serde(skip_serializing_if = "Option::is_none")]
            labels: Option<&'a str>,
        }

        let url = format!(
            "{}/repos/{}/{}/pulls",
            self.base_url, params.owner, params.repo
        );

        let body = CreatePrBody {
            title: params.title,
            head: params.head,
            base: params.base,
            body: Some(params.body),
            labels: None,
        };

        let response = self.client.post(&url).json(&body).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            bail!("Failed to create pull request: {status} - {error_text}");
        }

        let pr: ApiPullRequest = response.json().await?;
        Ok(pr.into())
    }

    pub async fn get_pull_request(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
    ) -> Result<GiteePr> {
        let url = format!(
            "{}/repos/{}/{}/pulls/{}",
            self.base_url, owner, repo, number
        );

        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            bail!("Failed to get pull request: {}", response.status());
        }

        let pr: ApiPullRequest = response.json().await?;
        Ok(pr.into())
    }

    /// Update a pull request (title, body, state)
    pub async fn update_pull_request(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
        params: serde_json::Value,
    ) -> Result<GiteePr> {
        let url = format!("{}/repos/{}/{}/pulls/{}", self.base_url, owner, repo, number);
        let response = self.client.patch(&url).json(&params).send().await?;
        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (PATCH /pulls/{}): HTTP {} - {}", number, status, text);
        }
        Ok(response.json().await?)
    }

    /// Merge a pull request
    pub async fn merge_pull_request(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
        merge_message: Option<&str>,
    ) -> Result<serde_json::Value> {
        let url = format!("{}/repos/{}/{}/pulls/{}/merge", self.base_url, owner, repo, number);
        let mut body = serde_json::json!({});
        if let Some(msg) = merge_message {
            body["merge_message"] = serde_json::Value::String(msg.to_string());
        }
        let response = self.client.put(&url).json(&body).send().await?;
        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (PUT /pulls/{}/merge): HTTP {} - {}", number, status, text);
        }
        Ok(response.json().await?)
    }

    // ---- Issue API methods ----

    /// List issues for a repository
    pub async fn list_issues(
        &self,
        owner: &str,
        repo: &str,
        state: &str,
        page: i64,
        per_page: i64,
    ) -> Result<Vec<GiteeIssue>> {
        let url = format!("{}/repos/{}/{}/issues", self.base_url, owner, repo);
        let response = self
            .client
            .get(&url)
            .query(&[
                ("state", state),
                ("page", &page.to_string()),
                ("per_page", &per_page.to_string()),
            ])
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (GET /issues): HTTP {} - {}", status, text);
        }

        let issues: Vec<GiteeIssue> = response.json().await?;
        Ok(issues)
    }

    /// Get a single issue by number
    pub async fn get_issue(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
    ) -> Result<GiteeIssue> {
        let url = format!("{}/repos/{}/{}/issues/{}", self.base_url, owner, repo, number);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (GET /issues/{}): HTTP {} - {}", number, status, text);
        }

        let issue: GiteeIssue = response.json().await?;
        Ok(issue)
    }

    /// Create a new issue
    pub async fn create_issue(
        &self,
        owner: &str,
        repo: &str,
        title: &str,
        body: &str,
        labels: &[&str],
    ) -> Result<GiteeIssue> {
        let url = format!("{}/repos/{}/{}/issues", self.base_url, owner, repo);

        let mut body_json = serde_json::json!({
            "title": title,
            "body": body,
        });
        if !labels.is_empty() {
            body_json["labels"] = serde_json::json!(labels);
        }

        let response = self.client.post(&url).json(&body_json).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (POST /issues): HTTP {} - {}", status, text);
        }

        let issue: GiteeIssue = response.json().await?;
        Ok(issue)
    }

    /// Update an issue (title, body, state, labels)
    pub async fn update_issue(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
        params: serde_json::Value,
    ) -> Result<GiteeIssue> {
        let url = format!("{}/repos/{}/{}/issues/{}", self.base_url, owner, repo, number);
        let response = self.client.patch(&url).json(&params).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (PATCH /issues/{}): HTTP {} - {}", number, status, text);
        }

        let issue: GiteeIssue = response.json().await?;
        Ok(issue)
    }

    /// List comments on an issue
    pub async fn list_issue_comments(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
    ) -> Result<Vec<serde_json::Value>> {
        let url = format!("{}/repos/{}/{}/issues/{}/comments", self.base_url, owner, repo, number);
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (GET /issues/{}/comments): HTTP {} - {}", number, status, text);
        }

        let comments: Vec<serde_json::Value> = response.json().await?;
        Ok(comments)
    }

    /// Create a comment on an issue
    pub async fn create_issue_comment(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
        body: &str,
    ) -> Result<serde_json::Value> {
        let url = format!("{}/repos/{}/{}/issues/{}/comments", self.base_url, owner, repo, number);
        let body_json = serde_json::json!({ "body": body });
        let response = self.client.post(&url).json(&body_json).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!("Gitee API error (POST /issues/{}/comments): HTTP {} - {}", number, status, text);
        }

        let comment: serde_json::Value = response.json().await?;
        Ok(comment)
    }

    /// List PR comments
    pub async fn list_pr_comments(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
    ) -> Result<Vec<GiteePrComment>> {
        let url = format!(
            "{}/repos/{}/{}/pulls/{}/comments",
            self.base_url, owner, repo, number
        );
        let response = self.client.get(&url).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!(
                "Gitee API error (GET /pulls/{}/comments): HTTP {} - {}",
                number,
                status,
                text
            );
        }

        let comments: Vec<GiteePrComment> = response.json().await?;
        Ok(comments)
    }

    /// Create a comment on a PR
    pub async fn create_pr_comment(
        &self,
        owner: &str,
        repo: &str,
        number: i64,
        body: &str,
    ) -> Result<GiteePrComment> {
        let url = format!(
            "{}/repos/{}/{}/pulls/{}/comments",
            self.base_url, owner, repo, number
        );
        let params = serde_json::json!({ "body": body });
        let response = self.client.post(&url).json(&params).send().await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            anyhow::bail!(
                "Gitee API error (POST /pulls/{}/comments): HTTP {} - {}",
                number,
                status,
                text
            );
        }

        let comment: GiteePrComment = response.json().await?;
        Ok(comment)
    }
}

pub struct CreatePullRequestParams<'a> {
    pub owner: &'a str,
    pub repo: &'a str,
    pub title: &'a str,
    pub head: &'a str,
    pub base: &'a str,
    pub body: &'a str,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthenticatedUser {
    pub username: String,
    pub avatar_url: Option<String>,
    pub name: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
    pub is_bot: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeLabel {
    pub name: String,
}

// ---- Issue types ----

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeIssue {
    pub html_url: String,
    pub number: i64,
    pub title: String,
    pub state: String,
    pub body: Option<String>,
    pub user: Option<GiteeIssueUser>,
    #[serde(default)]
    pub labels: Vec<GiteeLabel>,
    pub assignee: Option<GiteeIssueUser>,
    pub comments: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeIssueUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    pub avatar_url: Option<String>,
}

// ---- End Issue types ----

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeProject {
    pub id: i64,
    pub full_name: String,
    pub default_branch: Option<String>,
    pub forked_from_project_id: Option<i64>,
    pub permissions: Option<GiteeProjectPermissions>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteeProjectPermissions {
    pub admin: bool,
    pub push: bool,
    pub pull: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteePr {
    pub html_url: String,
    pub number: i64,
    pub title: String,
    pub state: String,
    pub body: Option<String>,
    pub user: Option<GiteePrUser>,
    pub head: GiteePrBranch,
    pub base: GiteePrBranch,
    pub labels: Vec<GiteeLabel>,
    pub draft: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub merged_at: Option<String>,
    pub closed_at: Option<String>,
    pub sha: String,
    pub merge_status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteePrUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteePrBranch {
    pub label: String,
    pub ref_field: String,
    pub sha: String,
    pub repo: Option<GiteePrRepo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteePrRepo {
    pub id: i64,
    pub full_name: String,
    pub clone_url: String,
    pub html_url: Option<String>,
    pub owner: Option<GiteePrUser>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GiteePrComment {
    pub id: i64,
    pub body: String,
    pub user: GiteePrUser,
    pub created_at: String,
    pub updated_at: String,
    pub path: Option<String>,
    pub line: Option<i64>,
}

// ---- API response deserialization types ----

#[derive(Debug, Deserialize)]
struct ApiPullRequest {
    html_url: String,
    number: i64,
    title: String,
    state: String,
    body: Option<String>,
    user: Option<ApiPrUser>,
    head: ApiPrBranch,
    base: ApiPrBranch,
    #[serde(default)]
    labels: Vec<ApiPrLabel>,
    #[serde(default)]
    draft: bool,
    created_at: Option<String>,
    updated_at: Option<String>,
    merged_at: Option<String>,
    #[serde(default)]
    closed_at: Option<String>,
    #[serde(default)]
    merge_status: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiPrUser {
    id: i64,
    login: String,
    name: Option<String>,
    #[serde(default)]
    email: Option<String>,
    avatar_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ApiPrBranch {
    label: String,
    #[serde(rename = "ref")]
    ref_field: String,
    sha: String,
    repo: Option<ApiPrRepo>,
}

#[derive(Debug, Deserialize)]
struct ApiPrRepo {
    id: i64,
    full_name: String,
    clone_url: String,
    #[serde(default)]
    html_url: Option<String>,
    owner: Option<ApiPrUser>,
}

#[derive(Debug, Deserialize)]
struct ApiPrLabel {
    name: String,
}

// ---- Conversions ----

impl From<ApiPrUser> for GiteePrUser {
    fn from(u: ApiPrUser) -> Self {
        GiteePrUser {
            id: u.id,
            login: u.login,
            name: u.name,
            email: u.email,
            avatar_url: u.avatar_url,
        }
    }
}

impl From<ApiPrBranch> for GiteePrBranch {
    fn from(b: ApiPrBranch) -> Self {
        GiteePrBranch {
            label: b.label,
            ref_field: b.ref_field,
            sha: b.sha,
            repo: b.repo.map(|r| GiteePrRepo {
                id: r.id,
                full_name: r.full_name,
                clone_url: r.clone_url,
                html_url: r.html_url,
                owner: r.owner.map(Into::into),
            }),
        }
    }
}

impl From<ApiPrLabel> for GiteeLabel {
    fn from(l: ApiPrLabel) -> Self {
        GiteeLabel { name: l.name }
    }
}

impl From<ApiPullRequest> for GiteePr {
    fn from(pr: ApiPullRequest) -> Self {
        let head_sha = pr.head.sha.clone();
        GiteePr {
            html_url: pr.html_url,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            body: pr.body,
            user: pr.user.map(Into::into),
            head: pr.head.into(),
            base: pr.base.into(),
            labels: pr.labels.into_iter().map(Into::into).collect(),
            draft: pr.draft,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            merged_at: pr.merged_at,
            closed_at: pr.closed_at,
            sha: head_sha,
            merge_status: pr.merge_status,
        }
    }
}

pub(crate) fn resolve_account(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    storage: &but_forge_storage::Controller,
) -> Result<crate::GiteeAccountIdentifier, anyhow::Error> {
    let known_accounts = crate::token::list_known_gitee_accounts(storage)?;
    let Some(default_account) = known_accounts.first() else {
        bail!(
            "No authenticated Gitee users found.\nRun 'but config forge auth' to authenticate with Gitee."
        );
    };
    let account = if let Some(account) = preferred_account {
        if known_accounts.contains(account) {
            account
        } else {
            bail!(
                "Preferred Gitee account '{account}' has not authenticated yet.\nRun 'but config forge auth' to authenticate, or choose another account."
            );
        }
    } else {
        default_account
    };

    Ok(account.to_owned())
}
