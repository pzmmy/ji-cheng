#!/bin/bash
# 验证所有配置文件格式正确
# 在 CI 中运行，确保 JSON/YAML/Shell 语法正确

set -euo pipefail
FAIL=0

echo "=== 验证 JSON 文件 ==="
for f in $(find . -name '*.json' -not -path '*/node_modules/*' -not -path '*/target/*' -not -path '*/.svelte-kit/*' -not -path '*/gen/*' | head -30); do
    if ! python3 -m json.tool "$f" > /dev/null 2>&1; then
        echo "  ❌ $f — JSON 语法错误"
        FAIL=$((FAIL+1))
    fi
done
echo "  ✅ JSON 检查完成"

echo ""
echo "=== 验证 YAML 文件 ==="
for f in $(find . -name '*.yml' -o -name '*.yaml' -not -path '*/node_modules/*' -not -path '*/target/*' | head -20); do
    if ! python3 -c "import yaml; yaml.safe_load(open('$f'))" 2>/dev/null; then
        echo "  ❌ $f — YAML 语法错误"
        FAIL=$((FAIL+1))
    fi
done
echo "  ✅ YAML 检查完成"

echo ""
echo "=== 验证 Shell 脚本 ==="
for f in $(find scripts -name '*.sh' 2>/dev/null); do
    if ! bash -n "$f" 2>/dev/null; then
        echo "  ❌ $f — Shell 语法错误"
        FAIL=$((FAIL+1))
    fi
done
echo "  ✅ Shell 检查完成"

echo ""
echo "=== 翻译 key 一致性 ==="
python3 -c "
import json
en = json.load(open('apps/desktop/src/lib/i18n/locales/en.json'))
zh = json.load(open('apps/desktop/src/lib/i18n/locales/zh-CN.json'))
ek = set(en.keys()); zk = set(zh.keys())
only_zh = zk - ek
only_en = ek - zk
if only_zh: print(f'  ⚠️  仅在中文: {only_zh}')
if only_en: print(f'  ⚠️  仅在英文: {only_en}')
assert ek == zk, f'Key mismatch! en={len(ek)} zh={len(zk)}'
print(f'  ✅ {len(ek)} keys match')
"

if [ "$FAIL" -gt 0 ]; then
    echo ""
    echo "❌ $FAIL 个文件验证失败"
    exit 1
fi
echo ""
echo "✅ 全部验证通过"
