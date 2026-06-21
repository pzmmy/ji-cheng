#!/bin/bash
# 纪程一键安装脚本
# 用途: 自动检测系统架构，从 GitHub Releases 下载对应安装包并安装
# 用法: curl -sSL https://github.com/pzmmy/ji-cheng/releases/latest/download/install.sh | bash
# 参数: [version] — 指定版本号（默认: latest）
# 示例:
#   curl -sSL https://git.io/jicheng | bash
#   bash scripts/install.sh v0.1.0

set -euo pipefail

REPO="pzmmy/ji-cheng"
VERSION="${1:-latest}"

echo "🔍 检测系统环境..."

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux)
        case "$ARCH" in
            x86_64)  PKG="deb" ;;
            aarch64) PKG="deb"; echo "⚠️  ARM64 暂未预编译，尝试从源码构建" ;;
            *)       echo "❌ 不支持的架构: $ARCH"; exit 1 ;;
        esac
        ;;
    Darwin)
        echo "❌ macOS 暂不支持，请从源码构建"
        echo "   详见: https://github.com/$REPO"
        exit 1
        ;;
    *)
        echo "❌ 不支持的系统: $OS"
        exit 1
        ;;
esac

echo "📥 下载纪程 v$VERSION ($PKG)..."
DOWNLOAD_URL="https://github.com/$REPO/releases/$VERSION/download/jicheng_$VERSION_amd64.deb"
if [ "$VERSION" = "latest" ]; then
    # Get latest release download URL
    DOWNLOAD_URL=$(curl -sL "https://api.github.com/repos/$REPO/releases/latest" | grep "browser_download_url.*deb" | head -1 | cut -d'"' -f4)
    if [ -z "$DOWNLOAD_URL" ]; then
        echo "❌ 无法获取最新版本下载链接"
        exit 1
    fi
    VERSION=$(echo "$DOWNLOAD_URL" | grep -oP 'v[\d.]+' | head -1)
fi

TMP_DEB=$(mktemp /tmp/jicheng.XXXXXX.deb)
trap 'rm -f "$TMP_DEB"' EXIT

curl -sSL "$DOWNLOAD_URL" -o "$TMP_DEB"
echo "✅ 下载完成 ($(du -h "$TMP_DEB" | cut -f1))"

echo "📦 安装..."
if command -v apt &>/dev/null; then
    sudo apt install -y "$TMP_DEB"
elif command -v dpkg &>/dev/null; then
    sudo dpkg -i "$TMP_DEB"
    sudo apt-get install -f -y 2>/dev/null || true
else
    echo "❌ 未检测到 apt/dpkg 包管理器"
    echo "   请手动安装: $DOWNLOAD_URL"
    exit 1
fi

echo ""
echo "✅ 纪程 $VERSION 安装成功！"
echo "   在应用菜单中搜索「纪程」启动"
echo "   首次使用请配置:"
echo "   • DeepSeek API Key: https://platform.deepseek.com"
echo "   • Gitee Token: https://gitee.com/profile/personal_access_tokens"
echo "   • SSH Key: 设置 → 集成 → SSH 密钥"
echo ""
echo "📖 使用指南: https://github.com/$REPO"
