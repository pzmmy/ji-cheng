#!/bin/bash
# Git pre-commit hook — 提交前自动运行关键检查
# 用途: 检查 Rust 编译、翻译 key 一致性、Shell 语法
# 用法: 安装后自动触发: ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
# 示例: 直接执行可手动触发: bash scripts/pre-commit.sh

set -euo pipefail

echo "🔍 Pre-commit 检查..."

FAILED=0

# Rust 编译检查（如果 Cargo.toml 或 src 有改动）
if git diff --cached --name-only | grep -qE '^crates/.*\.rs$|^crates/.*/Cargo\.toml$|^Cargo\.(toml|lock)$'; then
    echo "  - Rust 文件变更，运行 cargo check..."
    if source "$HOME/.cargo/env" 2>/dev/null && cargo check -p but-gitee -p but-forge 2>/dev/null; then
        echo "    ✅ cargo check 通过"
    else
        echo "    ❌ cargo check 失败"
        FAILED=1
    fi
else
    echo "  - 跳过 cargo check（无 Rust 文件变更）"
fi

# 翻译 key 一致性
if git diff --cached --name-only | grep -q 'locales/'; then
    echo "  - 翻译文件变更，检查 key 一致性..."
    if python3 -c "
import json
en = json.load(open('apps/desktop/src/lib/i18n/locales/en.json'))
zh = json.load(open('apps/desktop/src/lib/i18n/locales/zh-CN.json'))
ek = set(en.keys()); zk = set(zh.keys())
assert ek == zk, f'Key mismatch! en={len(ek)} zh={len(zk)}'
print('    ✅', len(ek), 'keys match')
" 2>&1; then
        :
    else
        echo "    ❌ 翻译 key 不一致"
        FAILED=1
    fi
else
    echo "  - 跳过翻译检查（无翻译文件变更）"
fi

# Shell 脚本语法
if git diff --cached --name-only | grep -q '\.sh$'; then
    echo "  - Shell 脚本变更，检查语法..."
    for f in $(git diff --cached --name-only | grep '\.sh$'); do
        if [ -f "$f" ]; then
            if bash -n "$f" 2>/dev/null; then
                echo "    ✅ $f"
            else
                echo "    ❌ $f 语法错误"
                FAILED=1
            fi
        fi
    done
else
    echo "  - 跳过 Shell 检查（无脚本变更）"
fi

if [ "$FAILED" -eq 0 ]; then
    echo "✅ Pre-commit 全部通过"
else
    echo "❌ Pre-commit 失败，请修复后重新提交"
    exit 1
fi
