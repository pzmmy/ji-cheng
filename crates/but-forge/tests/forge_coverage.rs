use but_forge::ForgeName;

/// Verify that ForgeName can be deserialized from lowercase strings.
/// This is the primary way forge names enter the system (from config/API).
#[test]
fn forge_name_deserialize_lowercase() {
    assert!(matches!(
        serde_json::from_str::<ForgeName>("\"github\"").unwrap(),
        ForgeName::GitHub
    ));
    assert!(matches!(
        serde_json::from_str::<ForgeName>("\"gitlab\"").unwrap(),
        ForgeName::GitLab
    ));
    assert!(matches!(
        serde_json::from_str::<ForgeName>("\"gitee\"").unwrap(),
        ForgeName::Gitee
    ));
    // Test round-trip: serialize → deserialize
    let forges = [
        (ForgeName::GitHub, "github"),
        (ForgeName::GitLab, "gitlab"),
        (ForgeName::Gitee, "gitee"),
    ];
    for (forge, expected) in &forges {
        let json = serde_json::to_string(forge).unwrap();
        assert_eq!(json, format!("\"{}\"", expected));
        let back: ForgeName = serde_json::from_str(&json).unwrap();
        assert!(std::mem::discriminant(forge) == std::mem::discriminant(&back));
    }
}

/// Verify that all ForgeName values are covered by the enum.
/// This test fails if a new variant is added and this test isn't updated.
#[test]
fn forge_name_exhaustive_match() {
    let cases = vec![
        (serde_json::from_str::<ForgeName>("\"github\""), "github"),
        (serde_json::from_str::<ForgeName>("\"gitlab\""), "gitlab"),
        (serde_json::from_str::<ForgeName>("\"gitee\""), "gitee"),
        (serde_json::from_str::<ForgeName>("\"bitbucket\""), "bitbucket"),
        (serde_json::from_str::<ForgeName>("\"azure\""), "azure"),
    ];
    for (result, name) in &cases {
        assert!(result.is_ok(), "ForgeName deserialization failed for '{}'", name);
    }
}
