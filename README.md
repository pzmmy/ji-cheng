# 纪程 — 为中文开发者打造的 Git 客户端

> **Git, 但更顺手。** 平行分支工作流 + 国产 AI + Gitee 全支持

纪程是基于 [GitButler](https://github.com/gitbutlerapp/gitbutler) v0.20.1 的中文增强版 Git 桌面客户端，采用 Tauri + Rust + Svelte 架构。

## ✨ 特色功能

### 🧩 智能分支管理
- **平行分支** — 同时处理多个任务，无需切换分支，告别 `git stash`
- **栈式分支** — 依赖分支依次审核，PR 分层管理
- **无限撤销** — 所有操作均可回溯

### 🇨🇳 中国开发者专属
- **Gitee 完整支持** — 创建 PR、查看 Issue、管理 SSH 密钥，全部在应用内完成
- **国产 AI 厂商** — 集成 DeepSeek、通义千问、智谱 GLM、Kimi、豆包
- **全中文界面** — 完整简体中文 i18n，577+ 翻译键
- **中文文档** — 所有文档为简体中文

### 🤖 AI 辅助
- **智能提交** — AI 自动生成 commit message（DeepSeek 驱动）
- **分支命名** — AI 根据变更内容自动生成分支名
- **AI 代码审查** — DeepSeek 审查代码变更加 🔴P0/🟡P1/🟢P2 分级
- **中文 Prompt** — 专为中文优化的 AI 提示模板

### 🚀 原生体验
- **轻量高效** — Tauri 框架，二进制仅 37MB
- **跨平台** — Windows / Linux（Ubuntu/Deepin/UOS） / macOS
- **系统原生** — 原生 UI，无 Electron 内存开销

## 📸 截图

> 截图待补充

## 🚀 快速开始

### 下载安装

从 [Releases](https://github.com/pzmmy/ji-cheng/releases) 页面下载：

| 平台 | 格式 | 一键安装 |
|------|------|----------|
| Linux (Ubuntu/Deepin/UOS) | `.deb` | `curl -sSL https://git.io/jicheng \| bash` |
| Windows | `.msi` | 下载后双击安装 |
| macOS | `.dmg`（待支持） | — |

### 配置 AI

首次使用，在 **设置 → AI** 中填入 DeepSeek API Key：
1. 访问 [platform.deepseek.com](https://platform.deepseek.com) 注册
2. 创建 API Key
3. 填入纪程设置页

### 连接 Gitee

在 **设置 → 集成 → Gitee** 中填入 Personal Access Token：
1. 访问 [gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens)
2. 创建 Token（勾选 `projects`、`pull_requests` 权限）
3. 填入纪程设置页

## 🛠️ 从源码构建

```bash
# 克隆
git clone https://github.com/pzmmy/ji-cheng.git
cd ji-cheng

# 安装依赖（国内镜像加速）
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" pnpm install

# 开发模式
pnpm dev:desktop

# 生产构建（Linux deb）
npx tauri build --config crates/gitbutler-tauri/tauri.conf.release.json --bundles deb
```

详细构建指南见 [docs/manual-release.md](docs/manual-release.md)

## 📦 项目结构

```
├── apps/desktop/          # 前端（Svelte + TypeScript）
│   ├── src/components/    # UI 组件
│   ├── src/lib/           # 业务逻辑
│   │   ├── ai/            # AI 模块（DeepSeek 等国产提供商）
│   │   ├── forge/gitee/   # Gitee 集成
│   │   └── i18n/          # 国际化（zh-CN / en）
├── crates/                # Rust 后端
│   ├── but-gitee/         # Gitee API 客户端（PR、Issue、评论）
│   ├── but-forge/         # Forge 抽象层（GitHub/GitLab/Gitee）
│   └── gitbutler-tauri/   # Tauri 应用入口
├── scripts/               # 工具脚本
│   ├── mirror-to-gitee.sh # GitHub → Gitee 镜像同步
│   └── deploy-pages.sh    # Gitee Pages 部署
└── docs/                  # 文档
```

## 🗺️ 发展路线

| Phase | 内容 | 状态 |
|-------|------|------|
| 0 | 中文化 + Gitee + AI 集成 | ✅ |
| 1 | 发布 v0.1.0（deb 包已上线） | ✅ |
| 2 | Code Review + 镜像 + AI 审查 | ✅ |
| 3 | Pages 部署 + 签名 + CI 支持 | ✅ |

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与。

建议先查看 [GitHub Issues](https://github.com/pzmmy/ji-cheng/issues) 了解当前待办。

## 📜 许可证

本项目基于 [FSL-1.1-MIT](LICENSE.md) 许可证。
FSL-1.1 允许非商业用途（教育、研究、内部使用）。
商业使用需额外授权。
