#!/bin/bash
# Rust 测试运行器（清理 fixture 后执行）
# 用途: 先删除生成的测试 fixture，再运行 cargo test，避免过期 fixture 造成误判
# 用法: ./scripts/cargo-test.sh [cargo-test 参数]
# 示例:
#   ./scripts/cargo-test.sh
#   ./scripts/cargo-test.sh -- --test-threads=4

./scripts/delete-fixtures.sh

echo "Running tests"
cargo test $@