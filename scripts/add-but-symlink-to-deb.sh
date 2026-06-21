#!/usr/bin/env bash
# 在 deb 包中注入 but → gitbutler-tauri 软链接
# 用途: 重新打包 .deb，在 /usr/bin/ 下添加 but → gitbutler-tauri 符号链接
#       使 dpkg 能够追踪该链接（避免 postinstall 脚本方案无法被包管理器追踪的问题）
# 用法: ./scripts/add-but-symlink-to-deb.sh <path-to-deb>
# 示例: ./scripts/add-but-symlink-to-deb.sh target/release/bundle/deb/jicheng_0.1.0_amd64.deb

set -euo pipefail

DEB_PATH="${1:-}"

if [ -z "$DEB_PATH" ]; then
	echo "Usage: $0 <path-to-deb>" >&2
	exit 1
fi

if [ ! -f "$DEB_PATH" ]; then
	echo "error: file not found: $DEB_PATH" >&2
	exit 1
fi

DEB_PATH="$(readlink -f "$DEB_PATH")"

WORK_DIR="$(mktemp -d)"
readonly WORK_DIR
trap 'rm -rf "$WORK_DIR"' EXIT

echo "repackaging $DEB_PATH to add /usr/bin/but symlink..."

dpkg-deb -R "$DEB_PATH" "$WORK_DIR/pkg"

if [ ! -f "$WORK_DIR/pkg/usr/bin/gitbutler-tauri" ]; then
	echo "error: /usr/bin/gitbutler-tauri not found in package" >&2
	exit 1
fi

ln -sf gitbutler-tauri "$WORK_DIR/pkg/usr/bin/but"

dpkg-deb --root-owner-group -Zgzip -b "$WORK_DIR/pkg" "$DEB_PATH"

echo "done: $DEB_PATH now contains /usr/bin/but -> gitbutler-tauri"
