# 手动 Release 指南

GA 自动构建在 Tauri 编译阶段未通过，改用手动打包发布。

## 前置条件

| 工具 | Windows | Linux |
|------|---------|-------|
| Rust | `rustup-init.exe` | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Node.js 22 | https://nodejs.org | `nvm install 22` |
| pnpm 10 | `npm i -g pnpm@10` | `npm i -g pnpm@10` |
| 系统库 | — | `sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev pkg-config libdbus-1-dev` |

## 构建步骤

### 1. 拉取最新代码

```bash
cd ji-cheng
git checkout main
git pull
```

### 2. 安装前端依赖

```bash
pnpm install
```

### 3. 构建前端

```bash
pnpm build:desktop
```

产物在 `apps/desktop/build/` 目录。

### 4. 构建 Tauri 应用

**Windows（推荐——当前最成熟）：**

```bash
cd apps/desktop
npx tauri build --config ../../crates/gitbutler-tauri/tauri.conf.release.json
```

**Linux：**

```bash
cd apps/desktop
npx tauri build --config ../../crates/gitbutler-tauri/tauri.conf.release.json
```

### 5. 查找产物

| 平台 | 路径 |
|------|------|
| Windows | `apps/desktop/target/release/bundle/msi/纪程_*.msi` |
| Linux | `apps/desktop/target/release/bundle/deb/纪程_*.deb` |
| Linux | `apps/desktop/target/release/bundle/appimage/纪程_*.AppImage` |

### 6. 发布到 GitHub

```bash
# 1. 创建 Release tag（如果还没打）
git tag v0.1.0
git push origin v0.1.0

# 2. 在浏览器打开 GitHub Releases 页面
# https://github.com/pzmmy/ji-cheng/releases/new
# 选择刚打的 tag，填标题和说明

# 3. 上传产物
# 把 .msi / .deb / .AppImage 文件拖到上传区域
```

或者用命令行：

```bash
# 安装 gh CLI
# 创建一个 Release 并上传
gh release create v0.1.0 \
  --title "纪程 v0.1.0" \
  --notes "首个 Release" \
  apps/desktop/target/release/bundle/msi/*.msi \
  apps/desktop/target/release/bundle/deb/*.deb
```

## 版本号规范

```
v0.1.0          ← 首个公开发布
v0.1.1          ← bug 修复
v0.2.0          ← 新功能
```

## 常见问题

### Rust 编译时 `libdbus-1-dev` 找不到

```bash
sudo apt install libdbus-1-dev pkg-config
```

### pnpm install 时 Electron 下载失败

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" pnpm install
```

### Tauri 构建提示 `beforeBuildCommand` 失败

tauri.conf.release.json 的 `beforeBuildCommand` 在 CI 模式下会跳过前端构建。本地构建时可以直接忽略或用 `-c` 跳过：

```bash
npx tauri build --config ../../crates/gitbutler-tauri/tauri.conf.release.json -b none
```

其实更简单：直接用默认 tauri.conf.json 构建（加 TAURI_CONFIG 覆盖）：

```bash
cd apps/desktop
TAURI_CONFIG='{"bundle":{"active":true,"targets":["msi"]}}' npx tauri build
```
