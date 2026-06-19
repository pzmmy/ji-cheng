use anyhow::{Context as _, Result};

use crate::{GiteeProjectId, client::GiteeClient};

pub async fn list(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    storage: &but_forge_storage::Controller,
) -> Result<Vec<crate::client::GiteePr>> {
    if let Ok(gl) = GiteeClient::from_storage(storage, preferred_account) {
        gl.list_open_prs(owner, repo)
            .await
            .context("Failed to list open pull requests")
    } else {
        Ok(vec![])
    }
}

pub async fn list_all_for_target(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    target_branch: &str,
    storage: &but_forge_storage::Controller,
) -> Result<Vec<crate::client::GiteePr>> {
    if let Ok(gl) = GiteeClient::from_storage(storage, preferred_account) {
        gl.list_prs_for_target(owner, repo, target_branch)
            .await
            .context("Failed to list pull requests for target branch")
    } else {
        Ok(vec![])
    }
}

pub async fn create(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    params: crate::client::CreatePullRequestParams<'_>,
    storage: &but_forge_storage::Controller,
) -> Result<crate::client::GiteePr> {
    let pr = GiteeClient::from_storage(storage, preferred_account)?
        .create_pull_request(&params)
        .await
        .context("Failed to create pull request")?;
    Ok(pr)
}

pub async fn get(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    pr_number: usize,
    storage: &but_forge_storage::Controller,
) -> Result<crate::client::GiteePr> {
    let pr_number = pr_number.try_into().context("PR number is too large")?;
    let pr = GiteeClient::from_storage(storage, preferred_account)?
        .get_pull_request(owner, repo, pr_number)
        .await
        .context("Failed to get pull request")?;
    Ok(pr)
}
