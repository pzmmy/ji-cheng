/// Verify that serialization round-trips for key types work.
#[test]
fn gitee_label_roundtrip() {
    let label = but_gitee::GiteeLabel {
        name: "bug".to_string(),
    };
    let json = serde_json::to_string(&label).unwrap();
    assert_eq!(json, r#"{"name":"bug"}"#);
    let back: but_gitee::GiteeLabel = serde_json::from_str(&json).unwrap();
    assert_eq!(back.name, "bug");
}

/// Verify GiteeUser serialization round-trip.
#[test]
fn gitee_user_roundtrip() {
    let json = r#"{"id":42,"login":"testuser","name":"Test","email":null,"avatar_url":null,"is_bot":false}"#;
    let user: but_gitee::GiteeUser = serde_json::from_str(json).unwrap();
    assert_eq!(user.login, "testuser");
    let back = serde_json::to_string(&user).unwrap();
    assert!(back.contains(r#""login":"testuser""#));
}

/// Verify GiteeIssue serialization.
#[test]
fn gitee_issue_serde() {
    let json = r#"{"html_url":"https://gitee.com/pzmmy/test/issues/1","number":1,"title":"Bug","state":"open","body":"Found a bug","user":{"id":1,"login":"u","name":null,"email":null,"avatar_url":null,"is_bot":false},"labels":[{"name":"bug"}],"assignee":{"id":2,"login":"dev","name":null,"email":null,"avatar_url":null,"is_bot":false},"comments":0,"created_at":"2026-06-01T10:00:00Z","updated_at":"2026-06-20T12:00:00Z","closed_at":null}"#;
    let issue: but_gitee::GiteeIssue = serde_json::from_str(json).unwrap();
    assert_eq!(issue.title, "Bug");
    assert_eq!(issue.labels.len(), 1);
    assert!(issue.assignee.is_some());
}
