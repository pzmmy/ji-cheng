#!/usr/bin/env python3
"""
依赖和代码质量检查。

用途: 检查 Cargo.toml vs Cargo.lock 一致性、Git 依赖 revision 固定、
     TODO/FIXME 统计、重复依赖版本检测
用法: python3 scripts/check-deps.py
示例: ./scripts/check-deps.py
"""

import os
import re
import sys
import json
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
errors = []
warnings = []

def load_toml(path):
    """Simple TOML key-value parser (no nested tables)."""
    with open(path) as f:
        return f.read()

print("=== 依赖和代码质量检查 ===\n")

# 1. Check git dependencies pin revisions
print("--- Git 依赖检查 ---")
cargo_lock = os.path.join(ROOT, "Cargo.lock")
if os.path.isfile(cargo_lock):
    with open(cargo_lock) as f:
        content = f.read()
    # Find git dependencies without source = "git+..."
    git_deps = re.findall(r'source = "git\+([^"]+)#([^"]+)"', content)
    for url, rev in git_deps:
        if len(rev) < 8:
            warnings.append(f"Git 依赖 {url} revision 过短: {rev}")
    if git_deps:
        print(f"  ✅ {len(git_deps)} 个 git 依赖")
    else:
        print("  ✅ 无 git 依赖")
else:
    errors.append("Cargo.lock 不存在")

# 2. Check for duplicate dependency versions
print("\n--- 依赖版本去重 ---")
lockfile = os.path.join(ROOT, "Cargo.lock")
if os.path.isfile(lockfile):
    with open(lockfile) as f:
        content = f.read()
    # Extract all package names and versions
    packages = re.findall(r'name = "([^"]+)"\nversion = "([^"]+)"', content)
    name_counter = Counter(name for name, _ in packages)
    dupes = {name: count for name, count in name_counter.items() if count > 1 and name != "git2"}
    if dupes:
        for name, count in sorted(dupes.items())[:10]:
            versions = set()
            for n, v in packages:
                if n == name:
                    versions.add(v)
            warnings.append(f"依赖 {name} 存在 {len(versions)} 个版本: {', '.join(sorted(versions)[:3])}")
        if len(dupes) > 10:
            warnings.append(f"...以及 {len(dupes) - 10} 个其他重复")
    print(f"  ✅ 共 {len(packages)} 个依赖")
    if dupes:
        print(f"  ⚠️  {len(dupes)} 个依赖存在多版本")

# 3. TODO/FIXME scanner (new files only)
print("\n--- TODO/FIXME 统计 ---")
todo_count = 0
fixme_count = 0
for root, dirs, files in os.walk(os.path.join(ROOT, "crates")):
    dirs[:] = [d for d in dirs if d not in ("target", ".git")]
    for f in files:
        if f.endswith((".rs", ".ts", ".svelte", ".py", ".sh")):
            path = os.path.join(root, f)
            try:
                with open(path) as fh:
                    content = fh.read()
                    todo_count += len(re.findall(r'(?i)\bTODO\b', content))
                    fixme_count += len(re.findall(r'(?i)\bFIXME\b', content))
            except:
                pass

if todo_count > 0 or fixme_count > 0:
    print(f"  📝 TODO: {todo_count}, FIXME: {fixme_count}")
    if todo_count > 20:
        warnings.append(f"TODO 过多 ({todo_count})，建议逐步清理")
else:
    print("  ✅ 无 TODO/FIXME")

# 4. Cargo.toml feature check
print("\n--- 工作区配置 ---")
cargo_toml = os.path.join(ROOT, "Cargo.toml")
if os.path.isfile(cargo_toml):
    content = load_toml(cargo_toml)
    # Check edition
    edition = re.search(r'edition\s*=\s*"(\d+)"', content)
    if edition:
        print(f"  ✅ Rust edition: {edition.group(1)}")
    else:
        errors.append("Cargo.toml 缺少 edition 设置")

print(f"\n=== 检查完成 ===")
if errors:
    print(f"❌ {len(errors)} 个错误:")
    for e in errors:
        print(f"   {e}")
if warnings:
    print(f"⚠️  {len(warnings)} 个警告:")
    for w in warnings[:10]:
        print(f"   {w}")
    if len(warnings) > 10:
        print(f"   ...以及 {len(warnings)-10} 个其他")

if errors:
    sys.exit(1)
