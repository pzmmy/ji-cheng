#!/bin/bash
# 纪程上游重建脚本
# 策略：备份 → 重新 fork → 移植定制代码
set -euo pipefail

REPO_DIR="/home/young/ji-cheng"
BACKUP_DIR="/home/young/ji-cheng-backup-$(date +%Y%m%d)"
NEW_DIR="/home/young/ji-cheng-reborn"

echo "=== 纪程上游重建 ==="
echo ""

# 步骤1：备份
echo "📦 [1/5] 备份当前代码..."
cp -a "$REPO_DIR" "$BACKUP_DIR"
echo "   ✅ 备份到 $BACKUP_DIR"

# 步骤2：定制代码清单
echo "📋 [2/5] 定制代码清单..."

# 新增文件（上游没有的）
cat > /tmp/jicheng-added.txt << 'FILES'
crates/but-gitee/
scripts/install.sh
scripts/mirror-to-gitee.sh
scripts/deploy-pages.sh
scripts/check-prereqs.sh
scripts/validate-all.sh
scripts/e2e-smoke-test.py
scripts/check-deps.py
scripts/check-workflows.py
scripts/check-project-integrity.py
scripts/pre-commit.sh
scripts/test-shell.sh
.env.example
docs/upstream-merge-strategy.md
docs/index.md
docs/windows-build.md
apps/desktop/src/lib/ai/prompts-zh.ts
apps/desktop/src/components/team/Dashboard.svelte
apps/desktop/e2e/smoke.spec.ts
.github/workflows/osv-scanner.yml
FILES
echo "   新增: $(wc -l < /tmp/jicheng-added.txt) 文件/目录"

# 修改文件
cat > /tmp/jicheng-modified.txt << 'FILES'
Cargo.toml
crates/but-forge/src/review.rs
crates/but-forge/src/lib.rs
crates/gitbutler-tauri/tauri.conf.release.json
crates/gitbutler-tauri/src/main.rs
crates/gitbutler-tauri/Cargo.toml
crates/gitbutler-tauri/capabilities/main.json
apps/desktop/src/lib/i18n/locales/zh-CN.json
apps/desktop/src/lib/i18n/locales/en.json
README.md
.github/workflows/ci.yml
.github/workflows/rust-check.yml
.github/workflows/zizmor.yml
FILES
echo "   修改: $(wc -l < /tmp/jicheng-modified.txt) 文件"

# 删除文件
echo "   删除: 无（纪程未删除上游文件）"

echo ""
echo "⚠️  上游 https://github.com/gitbutlerapp/gitbutler.git 从中国网络不可达"
echo ""
echo "替代方案（你可以在 Windows 终端执行）："
echo "  cd C:\\Users\\12442\\ji-cheng"
echo "  git clone --depth=1 https://github.com/gitbutlerapp/gitbutler.git C:\\Users\\12442\\ji-cheng-reborn"
echo "  cd C:\\Users\\12442\\ji-cheng-reborn"
echo "  xcopy /E /I /Y C:\\Users\\12442\\ji-cheng-backup-20260711\\crates\\but-gitee crates\\but-gitee"
echo "  # 或完整执行 rebuild"
echo ""
echo "后续步骤（需要代理或海外网络）："
echo "  cd /tmp"
echo "  git clone https://github.com/gitbutlerapp/gitbutler.git ji-cheng-reborn"
echo "  cd ji-cheng-reborn"
echo "  # 还原定制文件"
echo "  for f in \$(cat /tmp/jicheng-added.txt); do"
echo "    cp -r $BACKUP_DIR/\$f ./"
echo "  done"
echo "  # 还原修改文件"
echo "  for f in \$(cat /tmp/jicheng-modified.txt); do"
echo "    cp $BACKUP_DIR/\$f ./"
echo "  done"
echo "  # 添加 workspace 成员"
echo "  # members = [\"crates/but-gitee\"] → 加到 Cargo.toml"
echo "  cargo check --workspace"
echo "  cargo test -p but-gitee -p but-forge"
echo "  git remote add origin git@github.com:pzmmy/ji-cheng.git"
echo "  git push -f origin main"
