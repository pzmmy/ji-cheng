#!/bin/bash
# AppStream 元数据检查
# 用途: 验证 AppStream 元数据文件包含指定版本的 release 信息（在 CI 中防止过期元数据）
# 用法: ./scripts/check-appstream-metadata.sh <VERSION> <METADATA_FILE>
# 要求: xmlstarlet
# 示例: ./scripts/check-appstream-metadata.sh 0.1.0 packages/app/metadata.xml

set -euo pipefail

VERSION="$1"
METADATA_FILE="$2"

if [ -z "$VERSION" ] || [ ! -f "$METADATA_FILE" ]; then 
  echo "usage: check-appstream-metadata.sh <VERSION> <METADATA_FILE>"
  exit 1
fi

element=$(xmlstarlet sel -t -c "/component/releases/release[@version=\"$VERSION\"]" -n "$METADATA_FILE")

if [ -z "$element" ]; then
  echo "ERROR: No release for $VERSION in '$METADATA_FILE'"
  exit 1
fi

url=$(echo "$element" | xmlstarlet sel -t -v "/release/url" || echo '')
expected_url="https://github.com/gitbutlerapp/gitbutler/releases/tag/release%2F$VERSION"
if [ "$url" != "$expected_url" ]; then
  echo "ERROR: Expected release URL for $VERSION not found in '$METADATA_FILE'."
  echo ""
  echo "Expected URL: $expected_url"
  echo ""
  echo "    $element"
  exit 1
fi

echo "Release $VERSION in '$METADATA_FILE' looks OK"
echo ""
echo "    $element"
