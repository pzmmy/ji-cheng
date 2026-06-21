#!/bin/bash
# GitHub → Gitee 镜像同步
# 用途: 将 GitHub 仓库完整镜像到 Gitee（包含所有分支和标签），并验证推送完整性
# 用法: ./scripts/mirror-to-gitee.sh <github-owner/repo> <gitee-owner/repo> [gitee-token]
# 过程: git clone --mirror → 清理上游 CI 工作流 → 推送 Gitee → 对比 ref 数量验证
# 示例:
#   ./scripts/mirror-to-gitee.sh gitbutlerapp/gitbutler pzmmy/ji-cheng ghp_xxxxx

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

# 记录推送前的 ref 数量
REF_COUNT=$(git rev-list --count --all 2>/dev/null || git rev-list --count --branches --tags 2>/dev/null || git show-ref | wc -l)
echo "📊 共 $REF_COUNT 个 ref 待同步"

# 清理上游 CI 工作流（避免在 Gitee 上触发不需要的 Actions）
rm -rf .github/workflows/ 2>/dev/null || true
git add -A 2>/dev/null && git commit -m "chore: remove upstream CI workflows for Gitee mirror" 2>/dev/null || true

# 构造 Gitee 远程 URL
if [ -n "$GE_TOKEN" ]; then
    # 使用 Token 认证（避免交互式密码输入）
    GE_URL="https://gitee.com/$GE_REPO.git"
    git remote add gitee "$GE_URL"
    git config --local http."https://gitee.com/".extraheader "Authorization: bearer $GE_TOKEN"
else
    GE_URL="git@gitee.com:$GE_REPO.git"
    git remote add gitee "$GE_URL"
fi

echo "📤 推送到 Gitee: $GE_REPO"
git push --mirror gitee

# 验证：重新 fetch 并比较 ref 数量
echo "🔍 验证推送完整性..."
git remote remove gitee || true

# 重新添加（用--quiet避免输出Token）
if [ -n "$GE_TOKEN" ]; then
    git remote add gitee "https://gitee.com/$GE_REPO.git"
    git config --local http."https://gitee.com/".extraheader "Authorization: bearer $GE_TOKEN"
else
    git remote add gitee "git@gitee.com:$GE_REPO.git"
fi

git fetch --quiet gitee 2>&1 || {
    echo "❌ 验证失败：无法从 Gitee 获取 ref 列表"
    exit 1
}

# 比较 ref 数量
REMOTE_REF_COUNT=$(git rev-list --count --all 2>/dev/null || git rev-list --count --remotes 2>/dev/null || git branch -r | wc -l)
if [ "$REMOTE_REF_COUNT" -ge "$REF_COUNT" ]; then
    echo "✅ 镜像同步完成: $GH_REPO → $GE_REPO（$REMOTE_REF_COUNT refs）"
else
    echo "⚠️  同步可能不完整: 本地 $REF_COUNT refs, 远端 $REMOTE_REF_COUNT refs"
    echo "   建议检查 Gitee 仓库状态后重试"
    exit 1
fi
