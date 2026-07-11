# 上游合并策略

## 策略概述

纪程和墨屉均 fork 自活跃的开源上游。直接全量 merge 上游（纪程 28k commits、墨屉 3.3k commits）不可行——会冲掉所有定制代码。采用 **选择性 cherry-pick** 策略。

---

## 核心原则

```
┌─────────────────────────────────────────────────────┐
│  P0 — 必须合（安全/崩溃/构建）                        │
│  P1 — 应该合（新功能/性能/兼容性）                     │
│  P2 — 选合（架构/UI重写/无关功能）                     │
└─────────────────────────────────────────────────────┘
```

### P0 — 必须合

遇到即合，不等周期。

- **CVE 安全补丁** — CVSS ≥ 7.0 或涉及代码执行/提权/数据泄露
- **关键 bug 修复** — 导致崩溃、数据丢失、无法使用的 bug
- **构建修复** — 上游 CI/CD 流程修复，影响我们也能用的
- **依赖安全升级** — Cargo.lock / package.json 中高危 CVE 修复

### P1 — 应该合

用户能感知的价值，纳入季度合并计划。

- **新功能** — 上游发布的重要功能（新 diff 引擎、更快的 clone、虚拟分支改进...）
- **性能优化** — 打开大仓库更快、内存占用更低、操作响应更流畅
- **用户体验** — 交互改进、快捷键、界面优化
- **平台兼容性** — 新 Linux 发行版支持、Wayland 改进、显示器缩放
- **API 兼容** — 我们集成的 Gitee API / AI 厂商 API 在上游的适应性改动

### P2 — 选合

- **架构重构** — 模块拆分、重命名、目录重组（冲突极高、收益不确定）
- **UI 重写** — 上游的 UI 改动与我们的中文/AI/Gitee 定制冲突
- **无关新功能** — Windows ARM 支持、macOS 独有功能等

---

## 操作流程

### 1. 每周检查（5 分钟）

自动 cron：每周一 9:00 统计上游 commit 数量 + 筛选安全/功能关键词。

```bash
# 手动检查也行
cd ji-cheng && git fetch upstream

# 统计落后数量
echo "纪程: $(git rev-list --count HEAD..upstream/master) commits behind"

# 列出新 commit
git log HEAD..upstream/master --oneline --no-merges -100
```

### 2. 筛选候选 commit

```bash
git log HEAD..upstream/master --oneline --no-merges -200 > /tmp/u.txt

# P0: 安全/崩溃
grep -iE 'security|cve|vuln|crash|panic|unsound|segfault|deadlock|leak' /tmp/u.txt

# P1: 功能/性能/体验
grep -iE 'feat|perf|optimize|speed|improve|support|add|new' /tmp/u.txt

# P1: 修复
grep -iE 'fix|bug|regression|hotfix' /tmp/u.txt
```

### 3. cherry-pick

```bash
# 创建 merge 分支
git checkout -b merge/upstream-YYYY-MM-DD

# 按时间顺序逐个合（从旧到新避免依赖缺失）
git cherry-pick <oldest-commit>
git cherry-pick <next-commit>
# ...

# 遇冲突 → 评估：是定制代码冲突还是单纯合并冲突？
# 定制代码冲突 → git cherry-pick --abort，跳过此 commit
# 单纯合并冲突 → 手动解决 → git add → git cherry-pick --continue
```

### 4. 验证

```bash
# 编译
cargo check --workspace
cargo test -p but-gitee -p but-forge

# 前端
pnpm build:desktop

# 安全扫描（CI 自动）
```

### 5. 签署

```bash
git commit -m "chore(merge): cherry-pick upstream <日期>

Upstream: gitbutlerapp/gitbutler@<HEAD_SHA>
P0: <commit-hash> <标题>
P1: <commit-hash> <标题>
跳过: <原因>

Conflict resolution: <说明>
"
# → 审爷 review → sign-off → merge to main
```

---

## 时间周期

| 层级 | 频率 | 方式 | 工作量 |
|------|------|------|--------|
| **P0 检查** | **每周一 9:00** | 自动 cron 扫描安全/崩溃关键词 | 5 分钟 |
| **P1 合并** | **每月初** | cherry-pick 新功能/性能/体验 | 1-2 小时 |
| **P2 评估** | **每季度** | 评估架构/UI 改动的收益 | 0.5 小时 |

### P0 紧急通道

OSV-Scanner 和 Zizmor 在每次 push 时自动跑。如果扫描出高危漏洞，CI 会直接标红，立即处理——不等周期。

---

## 自动化辅助

| 工具 | 作用 | 频率 |
|------|------|------|
| **每周检查 cron** | 统计上游 commit + 关键词筛选 | 每周一 9:00 |
| **OSV-Scanner** | 依赖漏洞扫描 | 每次 push |
| **Zizmor** | GitHub Actions 安全分析 | 每次 push |
| **纪程 CI** | 编译 + 测试 + 冒烟 | 每次 push |

---

## 历史参考

### 纪程（基于 v0.20.1）
- Fork time: 2026-06
- Behind upstream: ~28,037 commits
- Custom code: Gitee forge、AI providers、中文 UI、SSH key 管理
- 高风险冲突区域：`crates/but-forge/`、`crates/gitbutler-tauri/`、`apps/desktop/src/lib/i18n/`

### 墨屉（基于 tolaria 早期版本）
- Fork time: 2026-05
- Behind upstream: ~3,342 commits
- Custom code: 中文 UI、功能调整
- 高风险冲突区域：`src/`（前端）、`src-tauri/`（后端）
