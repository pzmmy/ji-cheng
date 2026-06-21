#!/bin/bash
# 代码格式化工具
# 用途: 自动格式化 Rust（cargo fmt）和前端（pnpm fix + format）代码
# 用法: ./scripts/format.sh [rust|node]
#   不加参数同时格式化 Rust 和前端
#   指定 rust 或 node 只格式化对应部分
# 示例:
#   ./scripts/format.sh        # 全部格式化
#   ./scripts/format.sh rust   # 仅格式化 Rust
#   ./scripts/format.sh node   # 仅格式化前端

set -o errexit
set -o nounset
set -o pipefail

function rust() {
	cargo fmt
}

function node() {
	pnpm fix
	pnpm format
}

if [[ "$#" -eq 0 ]]; then
	set -o xtrace
	rust
	node
else
	case "$1" in
	rust)
		set -o xtrace
		rust
		;;
	node)
		set -o xtrace
		node
		;;
	*)
		echo "Invalid argument: $1"
		exit 1
		;;
	esac
	exit 0
fi
