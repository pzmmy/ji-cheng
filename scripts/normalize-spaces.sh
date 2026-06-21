#!/usr/bin/env bash
# 文件名空格替换工具
# 用途: 将指定目录下所有文件名中的空格替换为下划线
# 用法: ./scripts/normalize-spaces.sh <directory>
# 示例: ./scripts/normalize-spaces.sh ./docs

set -euo pipefail

ROOT_DIR="${1:-}"

if [ -z "$ROOT_DIR" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

find "$ROOT_DIR" -type f -name '*' -print0 | while IFS= read -r -d '' file; do
    new_file="$(echo "$file" | tr ' ' '_')"
    if [[ "$file" != "$new_file" ]]; then
        mv -v "$file" "$new_file"
    fi
done
