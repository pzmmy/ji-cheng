use anyhow::{Context as _, Result};
use but_secret::Sensitive;

mod client;
pub mod pr;
mod project;
pub use client::{
    CreatePullRequestParams, GiteeClient, GiteeLabel, GiteePr, GiteePrUser, GiteeProject,
    GiteeUser,
};
pub use project::{GiteeProjectId, fetch_project};
mod token;
use serde::Serialize;
pub use token::GiteeAccountIdentifier;

#[derive(Debug, Clone)]
pub struct AuthStatusResponse {
    /// The access token.
    /// This is only shared with the FrontEnd temporarily as we undergo the migration to having all API calls
    /// made to the forges from the Rustend.
    pub access_token: Sensitive<String>,
    pub username: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub host: Option<String>,
}

/// Store a PAT access token and fetch the associated user data.
pub async fn store_pat(
    access_token: &Sensitive<String>,
    storage: &but_forge_storage::Controller,
) -> Result<AuthStatusResponse> {
    let user = fetch_and_persist_pat_user_data(access_token, storage).await?;
    Ok(AuthStatusResponse {
        access_token: access_token.clone(),
        username: user.username,
        name: user.name,
        email: user.email,
        host: None,
    })
}

/// Cache the user profile so it's available offline.
fn cache_user_profile(
    account: &GiteeAccountIdentifier,
    user: &client::AuthenticatedUser,
    storage: &but_forge_storage::Controller,
) {
    let profile = but_forge_storage::settings::CachedProfile {
        avatar_url: user.avatar_url.clone(),
        name: user.name.clone(),
        email: user.email.clone(),
    };
    let key = account.cache_key();
    let existing = storage.cached_profile(&key).ok().flatten();
    if existing.as_ref() == Some(&profile) {
        return;
    }
    if let Err(err) = storage.set_cached_profile(&key, Some(profile)) {
        tracing::warn!(?account, "Failed to update cached Gitee profile: {err}");
    }
}

/// Fetch the authenticated user data from Gitee and persist the access token. (PAT)
async fn fetch_and_persist_pat_user_data(
    access_token: &Sensitive<String>,
    storage: &but_forge_storage::Controller,
) -> Result<client::AuthenticatedUser, anyhow::Error> {
    let gl = client::GiteeClient::new(access_token).context("Failed to create Gitee client")?;
    let user = gl
        .get_authenticated()
        .await
        .context("Failed to get authenticated user")?;
    let account_id = token::GiteeAccountIdentifier::pat(&user.username);
    token::persist_gitee_access_token(&account_id, access_token, storage)
        .context("Failed to persist access token")?;
    cache_user_profile(&account_id, &user, storage);
    Ok(user)
}

pub fn forget_gitee_access_token(
    account: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<()> {
    token::delete_gitee_access_token(account, storage).context("Failed to delete access token")
}

pub async fn get_gitee_user(
    account: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<Option<AuthenticatedUser>> {
    if let Some(access_token) = token::get_gitee_access_token(account, storage)? {
        let gl = GiteeClient::new(&access_token)
            .context("Failed to create Gitee client")?;
        match gl.get_authenticated().await {
            Ok(user) => {
                cache_user_profile(account, &user, storage);
                Ok(Some(AuthenticatedUser {
                    access_token,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    avatar_url: user.avatar_url,
                }))
            }
            Err(client_err) => {
                let cache_key = account.cache_key();
                // Check if this is a network error — return cached data if available.
                if let Some(reqwest_err) = client_err.downcast_ref::<reqwest::Error>()
                    && is_network_error(reqwest_err)
                {
                    match storage.cached_profile(&cache_key) {
                        Ok(Some(cached)) => {
                            return Ok(Some(AuthenticatedUser {
                                access_token,
                                username: account.username().to_owned(),
                                avatar_url: cached.avatar_url,
                                name: cached.name,
                                email: cached.email,
                            }));
                        }
                        Ok(None) => {}
                        Err(err) => {
                            tracing::warn!("Failed to read cached Gitee profile: {err}");
                        }
                    }
                    return Err(client_err.context(but_error::Context::new_static(
                        but_error::Code::NetworkError,
                        "Unable to connect to Gitee.",
                    )));
                }
                // Check if this is an auth error (401/403) — clear cached profile.
                if let Some(http_err) = client_err.downcast_ref::<client::HttpStatusError>()
                    && matches!(
                        http_err.status,
                        reqwest::StatusCode::UNAUTHORIZED | reqwest::StatusCode::FORBIDDEN
                    )
                    && let Err(err) = storage.set_cached_profile(&cache_key, None)
                {
                    tracing::warn!("Failed to clear cached Gitee profile: {err}");
                }
                Err(client_err.context("Failed to get authenticated user"))
            }
        }
    } else {
        Ok(None)
    }
}

/// Check if an error is a network connectivity error.
fn is_network_error(err: &reqwest::Error) -> bool {
    err.is_timeout() || err.is_connect() || err.is_request()
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub enum CredentialCheckResult {
    Valid,
    Invalid,
    NoCredentials,
}

/// Check the validity of the stored credentials for the given Gitee account.
pub async fn check_credentials(
    account: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<CredentialCheckResult> {
    if let Some(access_token) = token::get_gitee_access_token(account, storage)? {
        let gl = GiteeClient::new(&access_token)
            .context("Failed to create Gitee client")?;
        match gl.get_authenticated().await {
            Ok(_) => Ok(CredentialCheckResult::Valid),
            Err(_) => Ok(CredentialCheckResult::Invalid),
        }
    } else {
        Ok(CredentialCheckResult::NoCredentials)
    }
}

pub fn list_known_gitee_accounts(
    storage: &but_forge_storage::Controller,
) -> Result<Vec<token::GiteeAccountIdentifier>> {
    token::list_known_gitee_accounts(storage).context("Failed to list known Gitee usernames")
}

pub fn clear_all_gitee_tokens(storage: &but_forge_storage::Controller) -> Result<()> {
    token::clear_all_gitee_accounts(storage).context("Failed to clear all Gitee tokens")
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub access_token: Sensitive<String>,
    pub username: String,
    pub avatar_url: Option<String>,
    pub name: Option<String>,
    pub email: Option<String>,
}

/// JSON serialization types for Gitee API responses.
pub mod json {
    use serde::Serialize;

    use crate::{AuthStatusResponse, AuthenticatedUser};

    #[derive(Debug, Serialize)]
    #[cfg_attr(feature = "export-schema", derive(schemars::JsonSchema))]
    #[cfg_attr(
        feature = "export-schema",
        schemars(rename = "GiteeAuthStatusResponseSensitive")
    )]
    #[serde(rename_all = "camelCase")]
    pub struct AuthStatusResponseSensitive {
        pub access_token: String,
        pub username: String,
        pub name: Option<String>,
        pub email: Option<String>,
        pub host: Option<String>,
    }

    impl From<AuthStatusResponse> for AuthStatusResponseSensitive {
        fn from(
            AuthStatusResponse {
                access_token,
                username,
                name,
                email,
                host,
            }: AuthStatusResponse,
        ) -> Self {
            AuthStatusResponseSensitive {
                access_token: access_token.0,
                username,
                name,
                email,
                host,
            }
        }
    }

    #[cfg(feature = "export-schema")]
    but_schemars::register_sdk_type!(AuthStatusResponseSensitive);

    #[derive(Debug, Serialize)]
    #[cfg_attr(feature = "export-schema", derive(schemars::JsonSchema))]
    #[cfg_attr(
        feature = "export-schema",
        schemars(rename = "GiteeAuthenticatedUserSensitive")
    )]
    #[serde(rename_all = "camelCase")]
    pub struct AuthenticatedUserSensitive {
        pub access_token: String,
        pub username: String,
        pub avatar_url: Option<String>,
        pub name: Option<String>,
        pub email: Option<String>,
    }

    impl From<AuthenticatedUser> for AuthenticatedUserSensitive {
        fn from(
            AuthenticatedUser {
                access_token,
                username,
                avatar_url,
                name,
                email,
            }: AuthenticatedUser,
        ) -> Self {
            AuthenticatedUserSensitive {
                access_token: access_token.0,
                username,
                avatar_url,
                name,
                email,
            }
        }
    }

    #[cfg(feature = "export-schema")]
    but_schemars::register_sdk_type!(AuthenticatedUserSensitive);
}
