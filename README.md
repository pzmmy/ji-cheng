# 纪程 — 为中文开发者打造的 Git 客户端

> **Git, 但更顺手。**

纪程是基于 [GitButler](https://github.com/gitbutlerapp/gitbutler) v0.20.1 的中文增强版 Git 桌面客户端，采用 Tauri + Rust + Svelte 架构。

## ✨ 特色功能

- **平行分支** — 同时处理多个任务，无需切换分支
- **栈式分支** — 依赖分支依次审核，PR 分层管理
- **无限撤销** — 所有操作均可回溯
- **虚拟暂存区** — 告别 `git stash` 的繁琐
- **AI 辅助** — 智能生成 commit 消息（集成 DeepSeek）
- **全中文界面** — 完整简体中文 i18n
- **原生体验** — Tauri 框架，轻量高效，支持 Win/Mac/Linux

## 🚀 快速开始

### 下载安装

从 [Releases](https://github.com/pzmmy/ji-cheng/releases) 页面下载对应平台的安装包。

### 从源码构建

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev:desktop

# 构建
pnpm build:desktop
```

## 📜 许可证

本项目基于 GitButler 的 [FSL-1.1-MIT](LICENSE.md) 许可证，允许非商业用途的教育、研究和内部使用。
