# 上游同步策略

## 背景
纪程是基于 GitButler v0.20.1 (release/0.20.1, ca00ff2) 的中文增强分支。
上游 GitButler 持续更新，纪程需要定期同步上游变更，同时保持中国特色化修改。

## 分支策略

```
main (纪程)         ← 中国特色化修改在此
  ↑ periodic merge
upstream/v0.20.x    ← 上游 release 分支（只读 mirror）
  ↑ fetch
gitbutler/main      ← 上游主分支（remote）
```

- `main` — 纪程主分支，所有中国特色化修改在此
- `upstream/v0.20.x` — 上游对应版本的只读镜像，用于 merge base
- 不直接 merge 上游 `master`（变化太大），而是 cherry-pick 关键修复

## 同步频率

| 类型 | 频率 | 操作 |
|------|------|------|
| 安全修复 | 发现后 7 天内 | cherry-pick 到 main |
| 关键 bug 修复 | 每月一次 | cherry-pick 到 main |
| 新功能 | 评估后按需 | 先评审再 cherry-pick |
| 版本升级 (v0.21+) | 季度评估 | 创建新 upstream branch 后三方 merge |

## 操作流程

### 1. 检查上游变更

```bash
cd ji-cheng
git remote add upstream https://github.com/gitbutlerapp/gitbutler.git
git fetch upstream
git log main..upstream/master --oneline --since="30 days ago" | head -20
```

### 2. Cherry-pick 安全/关键修复

```bash
# 找到需要 cherry-pick 的 commit
git log upstream/master --oneline --grep="fix\|security\|crash" --since="7 days ago"

# 创建同步分支
git checkout -b sync/upstream-$(date +%Y%m%d)

# cherry-pick（逐个进行，解决冲突）
git cherry-pick <commit-hash>

# 经审爷评审后合并到 main
```

### 3. 解决冲突

中国特色化修改与上游冲突时：
- Gitee forge 相关文件：保留纪程版本（上游无对应功能）
- AI provider 相关：保留纪程版本
- i18n 相关：合并双方修改
- CSP 相关：保留纪程版本（已加入国产域名）
- 其他文件：逐个评估，优先保留修复逻辑

### 4. 版本升级（v0.20 → v0.21）

```bash
# 创建新上游 tracking 分支
git branch upstream/v0.21.x ca00ff2  # upstream tag
git checkout -b upgrade/v0.21

# 三方 merge：纪程 main + 上游 v0.20 base + 上游 v0.21
git merge upstream/v0.21.x

# 解决冲突后，审爷评审
# 评审通过后合入 main
```

## 冲突高发文件

| 文件 | 风险 | 策略 |
|------|------|------|
| `apps/desktop/src/lib/i18n/locales/zh-CN.json` | 🔴 高 | 保留纪程版本，手动追加上游新 key |
| `crates/gitbutler-tauri/tauri.conf.json` | 🔴 高 | 保留纪程 CSP + 中文名 + 版权 |
| `crates/but-forge/src/forge.rs` | 🟡 中 | 需合并双方 enum 变更 |
| `crates/but-forge/src/forge_info.rs` | 🟡 中 | 保留纪程 Gitee 代码 |
| `crates/but-forge/src/review.rs` | 🟡 中 | 保留 Gitee dispatch 分支 |
| `Cargo.toml` (workspace) | 🟡 中 | 保留但-gitee 成员 |
| `apps/desktop/src/lib/ai/service.ts` | 🟡 中 | 保留 DeepSeek 默认 + 国产 provider |
| `apps/desktop/src/lib/ai/types.ts` | 🟡 中 | 保留国产 model enums |

## 自动同步

当前设置了 cron 每周一 09:00 触发上游检查（`sync-upstream.sh`）。
但由于国内网络对 GitHub 访问不稳定，建议手动执行并在 CI 上验证。

## 版本号规范

```
v0.20.1          ← 基于的上游版本
v0.20.1-zh.1     ← 纪程第 1 个中国特色版本
v0.20.1-zh.2     ← 纪程第 2 个中国特色版本
```

使用 semver 预发布标签（pre-release tag），清晰标识与上游的关系。
