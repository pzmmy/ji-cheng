#!/bin/bash
# 部署到 Gitee Pages
# 用法: ./scripts/deploy-pages.sh <gitee-owner/repo> [branch=gh-pages]
#
# 将指定分支推送到 Gitee Pages（需要仓库已开启 Pages 功能）

set -euo pipefail

SRC_BRANCH="${2:-gh-pages}"
GE_REPO="$1"

if [ -z "$GE_REPO" ]; then
    echo "用法: $0 <gitee-owner/repo> [branch=gh-pages]"
    echo "示例: $0 pzmmy/ji-cheng main"
    exit 1
fi

echo "📤 部署 $SRC_BRANCH 分支到 Gitee Pages: $GE_REPO"
echo "   请确保仓库已开启 Gitee Pages 功能："
echo "   仓库 → 服务 → Gitee Pages → 部署分支 = $SRC_BRANCH"
echo ""
echo "   如果尚未配置 Pages，请访问："
echo "   https://gitee.com/$GE_REPO/pages"
echo ""

# 检查本地是否有 pages 分支
if ! git rev-parse --verify "$SRC_BRANCH" 2>/dev/null; then
    echo "⚠️  本地不存在 $SRC_BRANCH 分支"
    echo "   请先创建并推送该分支"
    echo "   例如: git checkout -b $SRC_BRANCH && git push origin $SRC_BRANCH"
    exit 1
fi

echo "🚀 推送到 Gitee..."
git push gitee "$SRC_BRANCH:$SRC_BRANCH"

echo ""
echo "✅ 推送完成。Gitee Pages 将自动部署（约 1-2 分钟）。"
echo "   部署状态查看: https://gitee.com/$GE_REPO/pages"
