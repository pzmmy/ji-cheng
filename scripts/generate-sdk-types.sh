#!/bin/bash
# 生成 SDK TypeScript 类型声明
# 用途: 运行 pnpm format 格式化代码，检查 SDK 类型是否最新
# 用法: 在 CI 中执行；若检测到未提交的格式化变更则报错退出
# 示例: ./scripts/generate-sdk-types.sh

set -eu -o pipefail

git_root="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$git_root"

pnpm format

if ! git diff --quiet; then
  git diff --stat
  echo ""
  echo "Generated SDK types are out of date."
  echo "Run 'pnpm build:sdk && pnpm format' and commit the result."
  exit 2
fi
