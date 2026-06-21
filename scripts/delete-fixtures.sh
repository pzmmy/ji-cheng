#!/bin/bash
# 删除 Rust 测试自动生成的 fixture
# 用途: 清除 crates 下所有 generated-do-not-edit 测试夹具目录
# 用法: ./scripts/delete-fixtures.sh

echo "Deleting fixtures"
rm -rf crates/*/tests/fixtures/generated-do-not-edit