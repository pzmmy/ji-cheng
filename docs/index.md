# 纪程文档索引

> 纪程 — 为中文开发者打造的 Git 客户端

---

## 📖 快速入门

| 文档 | 说明 |
|------|------|
| [README.md](../README.md) | 项目总览、安装、从源码构建 |
| [DEVELOPMENT.md](../DEVELOPMENT.md) | 开发指南（本地搭建开发环境） |
| [frontend.md](../frontend.md) | 前端开发说明（Svelte + TypeScript） |

## 🔧 构建与发布

| 文档 | 说明 |
|------|------|
| [docs/manual-release.md](manual-release.md) | 手动发布流程 |
| [docs/windows-build.md](windows-build.md) | Windows 平台构建指南 |
| [docs/windows-signing.md](windows-signing.md) | Windows 代码签名 |
| [docs/linux-compatibility.md](linux-compatibility.md) | Linux 兼容性说明（Ubuntu/Deepin/UOS） |

## 🔄 同步与集成

| 文档 | 说明 |
|------|------|
| [docs/upstream-sync-strategy.md](upstream-sync-strategy.md) | 上游 GitButler 同步策略 |
| [docs/gitee-gap-analysis.md](gitee-gap-analysis.md) | Gitee 与 GitHub 功能差异分析 |

## 🗺️ 路线图

| 文档 | 说明 |
|------|------|
| [docs/phase2-plan.md](phase2-plan.md) | Phase 2 开发计划 |

## 🛠️ 工具脚本

所有脚本位于 `scripts/` 目录，头部均包含用途、参数和示例注释。

| 脚本 | 用途 |
|------|------|
| `scripts/install.sh` | 一键安装纪程 |
| `scripts/pre-commit.sh` | Git pre-commit hook |
| `scripts/release.sh` | Tauri 构建发布 |
| `scripts/next.sh` | 版本号自增 |
| `scripts/format.sh` | 代码格式化 |
| `scripts/clean.sh` | 清理构建产物 |
| `scripts/cargo-test.sh` | Rust 测试运行 |
| `scripts/check-prereqs.sh` | 开发环境检查 |
| `scripts/check-deps.py` | 依赖和代码质量检查 |
| `scripts/check-workflows.py` | GitHub Actions 工作流验证 |
| `scripts/check-project-integrity.py` | 项目完整性检查 |
| `scripts/e2e-smoke-test.py` | 前端冒烟测试 |
| `scripts/validate-all.sh` | 配置文件格式验证 |
| `scripts/test-shell.sh` | Shell 脚本冒烟测试 |
| `scripts/mirror-to-gitee.sh` | GitHub → Gitee 镜像同步 |
| `scripts/deploy-pages.sh` | Gitee Pages 部署 |
| `scripts/normalize-spaces.sh` | 文件名空格替换 |
| `scripts/run-desktop-tauri-with-env.mjs` | 带环境变量的 Tauri 启动器 |
| `scripts/check-component-cycles.ts` | 组件循环依赖检测 |

## 📦 子包文档

| 包 | 文档 |
|---|------|
| but SDK | [packages/but-sdk/README.md](../packages/but-sdk/README.md) |
| shared | [packages/shared/README.md](../packages/shared/README.md) |
| UI 组件库 | [packages/ui/README.md](../packages/ui/README.md) |
| UI 组件脚本 | [packages/ui/scripts/README.md](../packages/ui/scripts/README.md) |
| svelte-comment-injector | [packages/svelte-comment-injector/README.md](../packages/svelte-comment-injector/README.md) |
| no-relative-imports | [packages/no-relative-imports/README.md](../packages/no-relative-imports/README.md) |

## 🧪 测试

| 文档 | 说明 |
|------|------|
| [e2e/README.md](../e2e/README.md) | E2E 测试说明 |
| [error-cleanup-checklist.md](../error-cleanup-checklist.md) | 错误清理检查清单 |
