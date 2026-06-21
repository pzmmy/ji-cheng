use but_gitee::*;

fn pr_user_json() -> String {
    r#"{"id":1,"login":"pzmmy","name":"pzmmy","email":null,"avatar_url":null,"is_bot":false}"#.to_string()
}

fn pr_branch_json(sha: &str) -> String {
    format!(
        r#"{{"label":"pzmmy:main","ref_field":"main","sha":"{}","user":{},"repo":{{"id":1,"full_name":"pzmmy/ji-cheng","clone_url":"https://gitee.com/pzmmy/ji-cheng.git"}}}}"#,
        sha, pr_user_json()
    )
}

fn pr_json(number: i64, title: &str, state: &str, body: Option<&str>, labels: &str) -> String {
    let body_json = match body {
        Some(b) => format!("\"{}\"", b),
        None => "null".to_string(),
    };
    format!(
        r##"{{
        "html_url":"https://gitee.com/pzmmy/test/pulls/{number}",
        "number":{number},"title":"{title}","state":"{state}",
        "body":{body},"user":{user},"head":{head},"base":{base},
        "labels":{labels},"draft":false,
        "created_at":"2026-06-01T10:00:00Z",
        "updated_at":"2026-06-20T12:00:00Z",
        "merged_at":null,"closed_at":null,
        "sha":"abc123","merge_status":"can_be_merged"
    }}"##,
        number = number,
        title = title,
        state = state,
        body = body_json,
        user = pr_user_json(),
        head = pr_branch_json("abc123"),
        base = pr_branch_json("def456"),
        labels = labels,
    )
}

#[test]
fn deserialize_gitee_pr() {
    let json = pr_json(1, "test", "open", Some("Adding CI"), "[]");
    let pr: GiteePr = serde_json::from_str(&json).unwrap();
    assert_eq!(pr.number, 1);
    assert_eq!(pr.title, "test");
    assert_eq!(pr.state, "open");
    assert_eq!(pr.body.as_deref(), Some("Adding CI"));
}

#[test]
fn deserialize_gitee_pr_with_labels() {
    let json = pr_json(2, "fix", "open", None, r##"[{"name":"bug"},{"name":"urgent"}]"##);
    let pr: GiteePr = serde_json::from_str(&json).unwrap();
    assert_eq!(pr.labels.len(), 2);
    assert_eq!(pr.labels[0].name, "bug");
    assert_eq!(pr.labels[1].name, "urgent");
}

#[test]
fn deserialize_gitee_pr_comment() {
    let json = format!(
        r##"{{"id":100,"body":"LGTM!","user":{},"created_at":"2026-06-20T12:00:00Z","updated_at":"2026-06-20T12:05:00Z","path":"src/main.rs","line":42}}"##,
        pr_user_json()
    );
    let comment: GiteePrComment = serde_json::from_str(&json).unwrap();
    assert_eq!(comment.body, "LGTM!");
    assert_eq!(comment.user.login, "pzmmy");
    assert_eq!(comment.path.as_deref(), Some("src/main.rs"));
    assert_eq!(comment.line, Some(42));
}

#[test]
fn deserialize_gitee_pr_comment_optional() {
    let json = format!(
        r##"{{"id":101,"body":"Nice","user":{},"created_at":"2026-06-20T12:00:00Z","updated_at":"2026-06-20T12:05:00Z","path":null,"line":null}}"##,
        pr_user_json()
    );
    let comment: GiteePrComment = serde_json::from_str(&json).unwrap();
    assert_eq!(comment.body, "Nice");
    assert!(comment.path.is_none());
    assert!(comment.line.is_none());
}

#[test]
fn deserialize_gitee_pr_branch_repo() {
    let json = br#"{"label":"pzmmy:main","ref_field":"main","sha":"abcdef","user":{"id":1,"login":"u","name":null,"email":null,"avatar_url":null,"is_bot":false},"repo":{"id":1,"full_name":"pzmmy/ji-cheng","clone_url":"https://gitee.com/pzmmy/ji-cheng.git"}}"#;
    let branch: GiteePrBranch = serde_json::from_slice(json).unwrap();
    assert_eq!(branch.sha, "abcdef");
    assert_eq!(branch.repo.as_ref().unwrap().full_name, "pzmmy/ji-cheng");
    assert!(branch.repo.is_some());
    assert_eq!(branch.repo.as_ref().unwrap().full_name, "pzmmy/ji-cheng");
}

#[test]
fn deserialize_gitee_label() {
    let json = r#"{"name": "enhancement"}"#;
    let label: GiteeLabel = serde_json::from_str(json).unwrap();
    assert_eq!(label.name, "enhancement");
}

#[test]
fn deserialize_gitee_user() {
    let json = r#"{"id":42,"login":"user1","name":"User One","email":"user@test.com","avatar_url":null,"is_bot":false}"#;
    let user: GiteeUser = serde_json::from_str(json).unwrap();
    assert_eq!(user.id, 42);
    assert_eq!(user.login, "user1");
}

#[test]
fn deserialize_gitee_pr_user() {
    let json = pr_user_json();
    let user: GiteePrUser = serde_json::from_str(&json).unwrap();
    assert_eq!(user.login, "pzmmy");
}
