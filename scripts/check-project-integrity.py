#!/usr/bin/env python3
"""
验证纪程项目和 Release 配置的完整性。

用途: 检查目录结构、必需文件、Release 配置、环境变量、翻译 key 一致性、Rust 工作区
用法: python3 scripts/check-project-integrity.py
示例: ./scripts/check-project-integrity.py
"""

import os
import json
import sys
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
errors = []

def check(condition, msg):
    if not condition:
        errors.append(f"❌ {msg}")
    else:
        print(f"  ✅ {msg}")

print("=== 项目完整性检查 ===\n")

# 1. 必需的目录结构
print("--- 目录结构 ---")
for d in ["apps/desktop/src", "crates/but-gitee/src", "crates/but-forge/src",
           "scripts", "docs", ".github/workflows", "crates/gitbutler-tauri"]:
    check(os.path.isdir(os.path.join(ROOT, d)), f"目录存在: {d}")

# 2. 必需的文件
print("\n--- 必需文件 ---")
for f in ["README.md", "Cargo.toml", ".env.example",
           "crates/gitbutler-tauri/tauri.conf.json",
           "crates/gitbutler-tauri/tauri.conf.release.json",
           "apps/desktop/src/lib/i18n/locales/zh-CN.json",
           "apps/desktop/src/lib/i18n/locales/en.json"]:
    check(os.path.isfile(os.path.join(ROOT, f)), f"文件存在: {f}")

# 3. Release 配置完整性
print("\n--- Release 配置 ---")
release_cfg = os.path.join(ROOT, "crates/gitbutler-tauri/tauri.conf.release.json")
if os.path.isfile(release_cfg):
    with open(release_cfg) as f:
        cfg = json.load(f)
    check("productName" in cfg, "productName 已设置")
    check("bundle" in cfg and cfg["bundle"].get("active"), "bundle.active = true")
    check("bundle" in cfg and "deb" in cfg.get("bundle", {}).get("targets", []) or
          cfg.get("bundle", {}).get("targets") == ["deb"] or
          "windows" in cfg.get("bundle", {}),
          "bundle targets 已配置")

# 4. .env.example 完整性
print("\n--- 环境变量 ---")
env_example = os.path.join(ROOT, ".env.example")
if os.path.isfile(env_example):
    with open(env_example) as f:
        content = f.read()
    for var in ["PUBLIC_SENTRY_ENVIRONMENT", "PUBLIC_POSTHOG_API_KEY", "PUBLIC_API_BASE_URL"]:
        check(var in content, f"环境变量已定义: {var}")

# 5. 翻译 key 一致性
print("\n--- 翻译文件 ---")
zh_file = os.path.join(ROOT, "apps/desktop/src/lib/i18n/locales/zh-CN.json")
en_file = os.path.join(ROOT, "apps/desktop/src/lib/i18n/locales/en.json")
if os.path.isfile(zh_file) and os.path.isfile(en_file):
    with open(zh_file) as f: zh = json.load(f)
    with open(en_file) as f: en = json.load(f)
    ek = set(en.keys()); zk = set(zh.keys())
    only_zh = zk - ek
    only_en = ek - zk
    check(len(only_zh) == 0, f"中文多出 {len(only_zh)} 个 key" if only_zh else "中英文 key 一致")
    check(len(only_en) == 0, f"英文多出 {len(only_en)} 个 key" if only_en else "英文 key 一致")
    check(len(ek) == len(zk), f"key 数量一致: en={len(ek)} zh={len(zk)}")

# 6. Rust workspace 配置
print("\n--- Rust 工作区 ---")
cargo_toml = os.path.join(ROOT, "Cargo.toml")
if os.path.isfile(cargo_toml):
    # Check that but-gitee and but-forge are in workspace members
    with open(cargo_toml) as f:
        content = f.read()
    check('"crates/but-gitee"' in content or 'crates/but-gitee' in content,
          "but-gitee 在 workspace 中")
    check('"crates/but-forge"' in content or 'crates/but-forge' in content,
          "but-forge 在 workspace 中")

print(f"\n=== 检查完成: {len(errors)} 个问题 ===")
if errors:
    for e in errors:
        print(e)
    sys.exit(1)
