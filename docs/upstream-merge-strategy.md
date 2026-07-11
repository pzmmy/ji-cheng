# 上游合并策略

## 策略概述

纪程和墨屉均 fork 自活跃的开源上游。直接全量 merge 上游（纪程 28k commits、墨屉 3.3k commits）不可行——会冲掉所有定制代码。采用 **选择性 cherry-pick** 策略。

---

## 核心原则

```
┌──────────────────────────────────────────────┐
│  只合必要的，不合所有的                        │
│                                              │
│  必合：安全补丁、关键 bug 修复、构建修复       │
│  选合：影响我们定制代码的新功能                │
│  不合：架构重构、UI 重写、无关新功能            │
└──────────────────────────────────────────────┘
```

### 必合（P0）
- **CVE 安全补丁** — CVSS ≥ 7.0 或涉及代码执行/提权
- **构建修复** — 上游 CI/CD 流程修复，影响我们也能用的
- **关键 bug 修复** — 导致崩溃、数据丢失、无法使用的 bug

### 选合（P1）
- **API 兼容性更新** — 如果我们集成的 API（Gitee、AI 厂商）在上游有改动
- **依赖版本更新** — Cargo.lock / package.json 的安全更新
- **性能优化** — 直接提升用户体验的

### 不合
- **架构重构** — 模块拆分、重命名、目录重组（冲突极高）
- **UI 重写** — 上游的 UI 改动与我们的中文/AI/Gitee 定制冲突
- **无关新功能** — Windows ARM 支持、macOS 独有功能等

---

## 操作流程

### 1. 定期检查（每月一次）

```bash
# 纪程
cd ji-cheng
git fetch upstream
git rev-list --count HEAD..upstream/master
# 如果返回值 > 50，进入审查流程

# 墨屉
cd mo-ti
git fetch upstream
git rev-list --count HEAD..upstream/main
# 如果返回值 > 30，进入审查流程
```

### 2. 筛选候选 commit

```bash
# 列出上游新 commit
git log HEAD..upstream/master --oneline --no-merges -100 > /tmp/upstream-commits.txt

# 筛选安全相关
grep -iE 'security|cve|vuln|fix|crash|panic|unsound|segfault|deadlock' /tmp/upstream-commits.txt

# 筛选 bug 修复
grep -iE 'fix|bug|error|regression|hotfix|patch' /tmp/upstream-commits.txt

# 筛选构建相关
grep -iE 'build|ci|compile|dependabot|cargo|npm|pnpm' /tmp/upstream-commits.txt
```

### 3. cherry-pick 安全补丁（P0）

```bash
# 创建一个 merge 分支
git checkout -b merge/upstream-2026-07

# 逐个 cherry-pick（按时间顺序，从旧到新）
git cherry-pick <commit-hash>

# 遇冲突时
git cherry-pick --abort   # 放弃这个 commit
# 或
# 手动解决冲突后
git add -A && git cherry-pick --continue
```

### 4. 验证

```bash
# 编译检查
cargo check --workspace  # 纪程
cargo check -p but-gitee -p but-forge  # 纪程（轻量）

# 运行测试
cargo test -p but-gitee  # 纪程

# 前端构建
pnpm build:desktop  # 纪程

# 安全扫描（自动）
# 等待 CI 中的 OSV-Scanner 完成
```

### 5. 签署合并

```bash
git commit -m "chore(merge): cherry-pick upstream commits <日期>

Upstream: gitbutlerapp/gitbutler@<sha>
Selected: <commit1> <commit2> ...
Scope: 安全补丁/构建修复/依赖更新
Conflict resolution: <说明>
"
git push origin merge/upstream-2026-07
# 创建 PR → 审爷 review → sign-off → merge to main
```

---

## 时间周期

| 项目 | 检查频率 | 单次工作量 | 负责人 |
|------|---------|-----------|--------|
| **纪程** | **每月 1 次**（每月初） | 1-2 小时 | 我 |
| **墨屉** | **每季度 1 次** | 0.5-1 小时 | 我 |

### 首次检查

```
纪程: 2026-07-01（7 月初）
墨屉: 2026-07-01（7 月初）
```

### 自动化辅助

已配置的 CI 检查会在每次 push 时自动拦截安全问题：
- **OSV-Scanner** → 依赖漏洞扫描
- **Zizmor** → GitHub Actions 安全分析
- **纪程 CI** → 编译检查 + 测试 + 冒烟测试

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
