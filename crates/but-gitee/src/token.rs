use std::sync::Mutex;

use anyhow::Result;
use but_secret::{Sensitive, secret};
use serde::{Deserialize, Serialize};

use crate::client::GiteeClient;

/// Persist Gitee account access tokens securely.
pub fn persist_gitee_access_token(
    account_id: &GiteeAccountIdentifier,
    access_token: &Sensitive<String>,
    storage: &but_forge_storage::Controller,
) -> Result<()> {
    let oauth_account = GiteeAccount::new(account_id, access_token.clone());
    persist_gitee_account(&oauth_account, storage)
}

/// Delete a Gitee account access token for a given username.
pub fn delete_gitee_access_token(
    account_id: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<()> {
    let account = find_gitee_account(account_id, storage)?;
    if let Some(account) = account {
        delete_gitee_account(&account, storage)
    } else {
        Ok(())
    }
}

/// Retrieve a Gitee account access token for a given username.
pub fn get_gitee_access_token(
    account_id: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<Option<Sensitive<String>>> {
    let account = find_gitee_account(account_id, storage)?;
    Ok(account.map(|acct| acct.access_token()))
}

pub fn list_known_gitee_accounts(
    storage: &but_forge_storage::Controller,
) -> Result<Vec<GiteeAccountIdentifier>> {
    Ok(storage
        .gitee_accounts()?
        .iter()
        .map(|account| account.into())
        .collect::<Vec<_>>())
}

pub fn clear_all_gitee_accounts(storage: &but_forge_storage::Controller) -> Result<()> {
    delete_all_gitee_accounts(storage)?;
    Ok(())
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-schema", derive(schemars::JsonSchema))]
#[serde(rename_all = "camelCase", tag = "type", content = "info")]
pub enum GiteeAccountIdentifier {
    PatUsername { username: String },
}
#[cfg(feature = "export-schema")]
but_schemars::register_sdk_type!(GiteeAccountIdentifier);

impl GiteeAccountIdentifier {
    pub fn pat(username: &str) -> Self {
        GiteeAccountIdentifier::PatUsername {
            username: username.to_string(),
        }
    }

    pub fn username(&self) -> &str {
        match self {
            GiteeAccountIdentifier::PatUsername { username } => username,
        }
    }

    /// The key used to store and look up the cached profile for this account.
    pub fn cache_key(&self) -> String {
        match self {
            GiteeAccountIdentifier::PatUsername { username } => {
                format!("gitee_pat_{username}")
            }
        }
    }

    pub fn client(&self, access_token: &Sensitive<String>) -> Result<GiteeClient> {
        GiteeClient::new(access_token)
    }
}

impl std::fmt::Display for GiteeAccountIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            GiteeAccountIdentifier::PatUsername { username } => write!(f, "PAT: {username}"),
        }
    }
}

pub enum GiteeAccount {
    Pat {
        username: String,
        access_token: Sensitive<String>,
    },
}

impl From<&GiteeAccount> for but_forge_storage::settings::GiteeAccount {
    fn from(account: &GiteeAccount) -> Self {
        let access_token_key = account.secret_key();
        match account {
            GiteeAccount::Pat { username, .. } => {
                but_forge_storage::settings::GiteeAccount::Pat {
                    username: username.to_owned(),
                    access_token_key,
                }
            }
        }
    }
}

impl From<&but_forge_storage::settings::GiteeAccount> for GiteeAccountIdentifier {
    fn from(account: &but_forge_storage::settings::GiteeAccount) -> Self {
        match account {
            but_forge_storage::settings::GiteeAccount::Pat { username, .. } => {
                GiteeAccountIdentifier::PatUsername {
                    username: username.to_owned(),
                }
            }
        }
    }
}

impl GiteeAccount {
    pub fn new(account_id: &GiteeAccountIdentifier, access_token: Sensitive<String>) -> Self {
        match account_id {
            GiteeAccountIdentifier::PatUsername { username } => GiteeAccount::Pat {
                username: username.to_owned(),
                access_token,
            },
        }
    }

    fn secret_key(&self) -> String {
        match self {
            GiteeAccount::Pat { username, .. } => {
                GiteeAccountIdentifier::pat(username).cache_key()
            }
        }
    }

    fn secret_value(&self) -> Result<Sensitive<String>> {
        Ok(self.access_token())
    }

    fn access_token(&self) -> Sensitive<String> {
        match self {
            GiteeAccount::Pat { access_token, .. } => access_token.clone(),
        }
    }
}

fn retrieve_gitee_secret(account_secret_key: &str) -> Result<Option<Sensitive<String>>> {
    static FAIR_QUEUE: Mutex<()> = Mutex::new(());
    let _one_at_a_time_to_prevent_races = FAIR_QUEUE.lock().unwrap();
    secret::retrieve(account_secret_key, secret::Namespace::BuildKind)
}

fn persist_gitee_account(
    account: &GiteeAccount,
    storage: &but_forge_storage::Controller,
) -> Result<()> {
    let secret_key = account.secret_key();
    storage.add_gitee_account(&account.into())?;

    static FAIR_QUEUE: Mutex<()> = Mutex::new(());
    let _one_at_a_time_to_prevent_races = FAIR_QUEUE.lock().unwrap();
    secret::persist(
        &secret_key,
        &account.secret_value()?,
        secret::Namespace::BuildKind,
    )
}

fn delete_gitee_account(
    account: &GiteeAccount,
    storage: &but_forge_storage::Controller,
) -> Result<()> {
    let secret_key = account.secret_key();
    storage.remove_gitee_account(&account.into())?;

    static FAIR_QUEUE: Mutex<()> = Mutex::new(());
    let _one_at_a_time_to_prevent_races = FAIR_QUEUE.lock().unwrap();
    secret::delete(&secret_key, secret::Namespace::BuildKind)
}

fn delete_all_gitee_accounts(storage: &but_forge_storage::Controller) -> Result<()> {
    let keys_to_delete = storage.clear_all_gitee_accounts()?;
    static FAIR_QUEUE: Mutex<()> = Mutex::new(());
    let _one_at_a_time_to_prevent_races = FAIR_QUEUE.lock().unwrap();
    for key in keys_to_delete {
        secret::delete(&key, secret::Namespace::BuildKind)?;
    }
    Ok(())
}

fn find_gitee_account(
    account_id: &GiteeAccountIdentifier,
    storage: &but_forge_storage::Controller,
) -> Result<Option<GiteeAccount>> {
    let accounts = storage.gitee_accounts()?;
    let result = match account_id {
        GiteeAccountIdentifier::PatUsername { username } => accounts.iter().find_map(|account| {
            if let but_forge_storage::settings::GiteeAccount::Pat {
                username: acct_username,
                access_token_key,
            } = account
                && acct_username == username
                && let Some(access_token) = retrieve_gitee_secret(access_token_key).ok().flatten()
            {
                return Some(GiteeAccount::Pat {
                    username: acct_username.clone(),
                    access_token,
                });
            }
            None
        }),
    };
    Ok(result)
}
