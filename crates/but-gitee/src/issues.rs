use anyhow::{Context as _, Result};

use crate::client::{GiteeClient, GiteeIssue};

pub async fn list(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    state: &str,
    page: i64,
    per_page: i64,
    storage: &but_forge_storage::Controller,
) -> Result<Vec<GiteeIssue>> {
    if let Ok(gl) = GiteeClient::from_storage(storage, preferred_account) {
        gl.list_issues(owner, repo, state, page, per_page)
            .await
            .context("Failed to list issues")
    } else {
        Ok(vec![])
    }
}

pub async fn get(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    number: i64,
    storage: &but_forge_storage::Controller,
) -> Result<GiteeIssue> {
    let issue = GiteeClient::from_storage(storage, preferred_account)?
        .get_issue(owner, repo, number)
        .await
        .context("Failed to get issue")?;
    Ok(issue)
}

pub async fn create(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    title: &str,
    body: &str,
    labels: &[&str],
    storage: &but_forge_storage::Controller,
) -> Result<GiteeIssue> {
    let issue = GiteeClient::from_storage(storage, preferred_account)?
        .create_issue(owner, repo, title, body, labels)
        .await
        .context("Failed to create issue")?;
    Ok(issue)
}

pub async fn update(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    number: i64,
    title: Option<&str>,
    body: Option<&str>,
    state: Option<&str>,
    storage: &but_forge_storage::Controller,
) -> Result<GiteeIssue> {
    let client = GiteeClient::from_storage(storage, preferred_account)?;
    let mut params = serde_json::json!({});
    if let Some(t) = title {
        params["title"] = serde_json::Value::String(t.to_string());
    }
    if let Some(b) = body {
        params["body"] = serde_json::Value::String(b.to_string());
    }
    if let Some(s) = state {
        params["state"] = serde_json::Value::String(s.to_string());
    }
    client
        .update_issue(owner, repo, number, params)
        .await
        .context("Failed to update issue")
}
