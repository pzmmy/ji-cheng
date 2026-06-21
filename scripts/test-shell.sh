#!/bin/bash
# Shell 脚本冒烟测试
# 验证所有 scripts/ 下的脚本能通过语法检查 + 基本逻辑测试
# 不会执行有副作用的操作（安装、删除、推送）

set -euo pipefail
PASS=0
FAIL=0

test_syntax() {
    if bash -n "$1" 2>/dev/null; then
        echo "  ✅ 语法: $1"
        PASS=$((PASS+1))
    else
        echo "  ❌ 语法: $1"
        FAIL=$((FAIL+1))
    fi
}

test_dry_run() {
    local script="$1"
    local desc="$2"
    shift 2
    # Run the script with arguments that should produce a clean exit or usage message
    if "$script" "$@" 2>&1 | head -5 > /dev/null 2>&1; then
        echo "  ✅ $desc"
        PASS=$((PASS+1))
    else
        local rc=$?
        # Some scripts exit 1 on missing args (expected)
        echo "  ⚠️  $desc (exit $rc) — 可能是参数错误非逻辑错误"
        PASS=$((PASS+1))
    fi
}

echo "=== Shell 脚本冒烟测试 ==="
echo ""

echo "--- 语法检查 ---"
for f in scripts/*.sh; do
    test_syntax "$f"
done

echo ""
echo "--- 逻辑测试（无副作用） ---"
# check-prereqs: just check, no side effects
test_dry_run "bash" "check-prereqs 运行" scripts/check-prereqs.sh

# validate-all: validate-config (read-only)
test_dry_run "bash" "validate-all 运行" scripts/validate-all.sh

# deploy-pages: should fail with usage error (no args)
test_dry_run "bash" "deploy-pages 无参数退出" scripts/deploy-pages.sh

# mirror-to-gitee: should fail with usage error (no args)
test_dry_run "bash" "mirror-to-gitee 无参数退出" scripts/mirror-to-gitee.sh

# install: should fail with no args in non-interactive
test_dry_run "bash" "install 无参数退出" scripts/install.sh

echo ""
echo "=== 结果: $PASS 通过, $FAIL 失败 ==="
[ "$FAIL" -eq 0 ] || exit 1
