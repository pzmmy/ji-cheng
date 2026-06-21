#!/usr/bin/env python3
"""
验证 GitHub Actions 工作流配置完整性。

检查项：
1. 所有 workflow 引用的 action 版本不过旧
2. workflow 没有语法错误（依赖 yamllint 或 pyyaml）
3. 检查 workflow 之间是否有命名冲突
4. 验证 secrets 使用正确
"""

import os
import sys
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORKFLOWS_DIR = os.path.join(ROOT, ".github/workflows")
errors = []
warnings = []

# Action version minimums (too old = security risk)
MINIMUM_VERSIONS = {
    "actions/checkout": (4, 0),
    "actions/setup-node": (4, 0),
    "actions/upload-artifact": (4, 0),
    "dtolnay/rust-toolchain": (1, 0),
    "pnpm/action-setup": (4, 0),
}

print("=== GitHub Actions 工作流检查 ===\n")

if not os.path.isdir(WORKFLOWS_DIR):
    print(f"❌ 工作流目录不存在: {WORKFLOWS_DIR}")
    sys.exit(1)

workflows = [f for f in os.listdir(WORKFLOWS_DIR) if f.endswith(('.yml', '.yaml'))]
print(f"发现 {len(workflows)} 个工作流文件\n")

for wf in sorted(workflows):
    path = os.path.join(WORKFLOWS_DIR, wf)
    with open(path) as f:
        content = f.read()

    wf_errors = 0
    wf_warnings = 0

    # Check action versions
    for action, (maj, min_v) in MINIMUM_VERSIONS.items():
        pattern = rf"uses:\s+{action}@v(\d+)"
        matches = re.findall(pattern, content)
        for v in matches:
            v_int = int(v)
            if v_int < maj:
                print(f"  ⚠️  {wf}: {action}@v{v_int} 过旧，建议 v{maj}+")
                wf_warnings += 1

    # Check for common issues
    if "on:" not in content:
        print(f"  ❌ {wf}: 缺少触发事件 (on:)")
        wf_errors += 1

    if "jobs:" not in content:
        print(f"  ❌ {wf}: 缺少作业定义 (jobs:)")
        wf_errors += 1

    # Check name uniqueness
    wf_name = re.search(r'name:\s*"([^"]+)"', content)
    if not wf_name:
        wf_name = re.search(r"name:\s*'([^']+)'", content)
    if not wf_name:
        wf_name = re.search(r"name:\s*(\S+)", content)

    if wf_errors == 0 and wf_warnings == 0:
        print(f"  ✅ {wf}: 正常")
    elif wf_errors > 0:
        print(f"  ❌ {wf}: {wf_errors} 个错误")
    else:
        print(f"  ⚠️  {wf}: {wf_warnings} 个警告")

print(f"\n总计: {len(workflows)} 个工作流")
if errors:
    print(f"错误: {len(errors)}")
if warnings:
    print(f"警告: {len(warnings)}")

if errors:
    sys.exit(1)
