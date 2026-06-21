/// Test edge cases for API response deserialization.
use but_gitee::*;

#[test]
fn empty_pr_list() {
    // Gitee API returns `[]` for repos with no PRs
    let prs: Vec<GiteePr> = serde_json::from_str("[]").unwrap();
    assert!(prs.is_empty());
}

#[test]
fn pr_with_null_optional_fields() {
    // Real API behavior: null body, null dates, null merge_status
    let json = r#"{
        "html_url": "https://gitee.com/pzmmy/test/pulls/3",
        "number": 3, "title": "fix", "state": "closed",
        "body": null,
        "user": null,
        "head": {"label":"a","ref_field":"main","sha":"abc","repo":null},
        "base": {"label":"b","ref_field":"main","sha":"def","repo":null},
        "labels": [], "draft": false,
        "created_at": null, "updated_at": null,
        "merged_at": null, "closed_at": null,
        "sha": "abc123", "merge_status": null
    }"#;
    let pr: GiteePr = serde_json::from_str(json).unwrap();
    assert!(pr.body.is_none());
    assert!(pr.user.is_none());
    assert!(pr.head.repo.is_none());
    assert!(pr.merge_status.is_none());
}

#[test]
fn pr_with_empty_labels() {
    let json = r#"{
        "html_url": "https://gitee.com/pzmmy/test/pulls/4",
        "number": 4, "title": "docs", "state": "open",
        "body": "", "user": {"id":1,"login":"u","name":null,"email":null,"avatar_url":null,"is_bot":false},
        "head": {"label":"a","ref_field":"main","sha":"a","repo":{"id":1,"full_name":"r","clone_url":"https://gitee.com/r.git"}},
        "base": {"label":"b","ref_field":"main","sha":"b","repo":{"id":1,"full_name":"r","clone_url":"https://gitee.com/r.git"}},
        "labels": [], "draft": false,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": null, "merged_at": null, "closed_at": null,
        "sha": "abc", "merge_status": "can_be_merged"
    }"#;
    let pr: GiteePr = serde_json::from_str(json).unwrap();
    assert_eq!(pr.body.as_deref(), Some(""));
    assert!(pr.labels.is_empty());
}

#[test]
fn comments_empty_list() {
    let comments: Vec<GiteePrComment> = serde_json::from_str("[]").unwrap();
    assert!(comments.is_empty());
}

#[test]
fn very_long_pr_title() {
    let title = "a".repeat(1000);
    let json = format!(
        r#"{{"html_url":"","number":1,"title":"{}","state":"open","body":null,"user":null,"head":{{"label":"a","ref_field":"main","sha":"a","repo":null}},"base":{{"label":"b","ref_field":"main","sha":"b","repo":null}},"labels":[],"draft":false,"created_at":null,"updated_at":null,"merged_at":null,"closed_at":null,"sha":"abc","merge_status":null}}"#,
        title
    );
    let pr: GiteePr = serde_json::from_str(&json).unwrap();
    assert_eq!(pr.title.len(), 1000);
}

#[test]
fn gitee_pr_comment_empty_body() {
    let json = r#"{"id":1,"body":"","user":{"id":1,"login":"u","name":null,"email":null,"avatar_url":null,"is_bot":false},"created_at":"2026-01-01T00:00:00Z","updated_at":"2026-01-01T00:00:00Z","path":null,"line":null}"#;
    let comment: GiteePrComment = serde_json::from_str(json).unwrap();
    assert!(comment.body.is_empty());
    assert!(comment.path.is_none());
}
