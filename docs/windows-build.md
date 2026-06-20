# Windows MSI 构建

## 前置条件
1. 安装 Rust (rustup.rs)
2. 安装 Node.js 22+
3. 设置镜像加速

## 构建命令

```powershell
# 设置镜像（国内加速）
$env:RUSTUP_DIST_SERVER="https://mirrors.ustc.edu.cn/rust-static"
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# 克隆并构建
git clone https://github.com/pzmmy/ji-cheng.git
cd ji-cheng
pnpm install
pnpm build:desktop

# 编译 MSI
npx tauri build --config crates/gitbutler-tauri/tauri.conf.release.json --bundles msi
```

## 产物
`apps\desktop\target\release\bundle\msi\纪程_*.msi`

## 上传
拖到 https://github.com/pzmmy/ji-cheng/releases/tag/v0.1.0
