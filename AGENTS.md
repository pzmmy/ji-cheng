# 纪程 Agent 指令

纪程是一个 Rust/Svelte/React/TypeScript monorepo。

应用所有相关的指令文件。如果指令之间存在冲突，按以下顺序解决：

1. 显式的人类指令
2. 最近的嵌套 `AGENTS.md`
3. 本文件

## 仓库地图

- `crates/` — Rust crates。
- `apps/desktop/` — Tauri/Svelte 桌面应用。
- `apps/web/` — Svelte Web 应用。
- `apps/lite/` — Electron/React 桌面应用。
- `packages/` — 共享的 TypeScript 包，包括 SDK。
- `e2e/` — Playwright、WebdriverIO 和黑盒端到端测试。

## 工作风格

- 进行有针对性、易于审查的修改。
- 在引入新模式之前，先检查附近的代码。
- 优先使用现有的 API、测试和约定。
- 避免无关的重写。
- 对所涉及的领域运行有针对性的验证。

## 作用域指令

- 对于 `crates/` 下的 Rust 工作，请遵循 `crates/AGENTS.md`。
- 对于 `apps/lite/` 下的 Lite 工作，请遵循 `apps/lite/AGENTS.md`。
