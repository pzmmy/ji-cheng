#!/bin/bash
# 开发环境检查
# 用途: 检查 Node.js、pnpm、Rust、系统库等必需工具链是否安装完整
# 用法: bash scripts/check-prereqs.sh
# 示例: ./scripts/check-prereqs.sh

set -euo pipefail

PASS=0
FAIL=0

check() {
    local name="$1"
    local cmd="$2"
    if eval "$cmd" &>/dev/null; then
        echo "  ✅ $name"
        PASS=$((PASS+1))
    else
        echo "  ❌ $name — 未安装或不可用"
        FAIL=$((FAIL+1))
    fi
}

echo "=== 纪程开发环境检查 ==="
echo ""

echo "--- 前端工具链 ---"
check "Node.js >= 20"       "node --version | grep -qE 'v(2[0-9]|[3-9][0-9])'"
check "pnpm >= 10"          "pnpm --version | grep -qE '^1[0-9]|^2[0-9]'"
check "Turbo (via pnpm)"    "pnpm exec turbo --version"
check "Rust"                "rustc --version"
check "Cargo"               "cargo --version"

echo ""
echo "--- 系统依赖（Linux） ---"
check "libwebkit2gtk-4.1"   "pkg-config --exists webkit2gtk-4.1 2>/dev/null || dpkg -l libwebkit2gtk-4.1-dev 2>/dev/null | grep -q '^ii'"
check "libgtk-3"            "pkg-config --exists gtk+-3.0 2>/dev/null || dpkg -l libgtk-3-dev 2>/dev/null | grep -q '^ii'"
check "libayatana-appind3"  "pkg-config --exists ayatana-appindicator3-0.1 2>/dev/null || dpkg -l libayatana-appindicator3-dev 2>/dev/null | grep -q '^ii'"

echo ""
echo "--- 环境变量 ---"
[ -n "${PUBLIC_SENTRY_ENVIRONMENT:-}" ]          && echo "  ✅ PUBLIC_SENTRY_ENVIRONMENT 已设置" && PASS=$((PASS+1)) || echo "  ⚠️  PUBLIC_SENTRY_ENVIRONMENT 未设置（构建可能需要）"
[ -n "${PUBLIC_POSTHOG_API_KEY:-}" ]             && echo "  ✅ PUBLIC_POSTHOG_API_KEY 已设置"      && PASS=$((PASS+1)) || echo "  ⚠️  PUBLIC_POSTHOG_API_KEY 未设置（构建可能需要）"
[ -n "${PUBLIC_API_BASE_URL:-}" ]                && echo "  ✅ PUBLIC_API_BASE_URL 已设置"         && PASS=$((PASS+1)) || echo "  ⚠️  PUBLIC_API_BASE_URL 未设置（构建可能需要）"

echo ""
echo "=== 检查完成: $PASS 通过, $FAIL 失败 ==="
if [ "$FAIL" -gt 0 ]; then
    echo "请安装缺失的工具后重试"
    exit 1
fi
