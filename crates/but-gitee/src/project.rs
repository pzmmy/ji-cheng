use std::fmt::Display;

use anyhow::Context;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GiteeProjectId {
    /// The username or group name that owns the project.
    username: String,
    /// The name of the project
    project_name: String,
}

impl GiteeProjectId {
    pub fn new(username: &str, project_name: &str) -> Self {
        GiteeProjectId {
            username: username.to_string(),
            project_name: project_name.to_string(),
        }
    }
}

impl Display for GiteeProjectId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let project_id = format!("{}/{}", self.username, self.project_name);
        write!(f, "{project_id}")
    }
}

/// Fetch the Gitee project information by its owner and repo name.
pub async fn fetch_project(
    preferred_account: Option<&crate::GiteeAccountIdentifier>,
    owner: &str,
    repo: &str,
    storage: &but_forge_storage::Controller,
) -> anyhow::Result<crate::client::GiteeProject> {
    crate::GiteeClient::from_storage(storage, preferred_account)?
        .get_project(owner, repo)
        .await
        .context("Failed to fetch project info")
}
