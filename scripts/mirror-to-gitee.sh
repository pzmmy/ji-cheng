#!/bin/bash
# GitHub → Gitee 镜像同步脚本
# 用法: ./scripts/mirror-to-gitee.sh <github-owner/repo> <gitee-owner/repo> [gitee-token]
#
# 示例: ./scripts/mirror-to-gitee.sh gitbutlerapp/gitbutler pzmmy/ji-cheng ghp_xxxxx

set -euo pipefail

if [ $# -lt 2 ]; then
    echo "用法: $0 <github-owner/repo> <gitee-owner/repo> [gitee-token]"
    echo "示例: $0 gitbutlerapp/gitbutler pzmmy/ji-cheng ghp_xxxxx"
    exit 1
fi

GH_REPO="$1"
GE_REPO="$2"
GE_TOKEN="${3:-}"

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "🔍 从 GitHub 克隆镜像: $GH_REPO"
git clone --mirror "https://github.com/$GH_REPO.git" "$WORKDIR/mirror"
cd "$WORKDIR/mirror"

# 清理上游 CI 工作流（可选，避免触发不需要的 CI）
rm -rf .github/workflows/ 2>/dev/null || true

if [ -n "$GE_TOKEN" ]; then
    GE_URL="https://pzmmy:$GE_TOKEN@gitee.com/$GE_REPO.git"
else
    GE_URL="git@gitee.com:$GE_REPO.git"
fi

echo "📤 推送到 Gitee: $GE_REPO"
git push --mirror "$GE_URL"

echo "✅ 镜像同步完成: $GH_REPO → $GE_REPO"
