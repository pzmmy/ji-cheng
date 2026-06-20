# Linux 兼容性指南

## 支持的目标发行版

| 发行版 | 状态 | 包格式 | 说明 |
|--------|------|--------|------|
| Ubuntu 22.04 LTS | ✅ 官方支持 | .deb + AppImage | CI 构建目标 |
| Ubuntu 24.04 LTS | ✅ 官方支持 | .deb + AppImage | 上游 GitButler 测试通过 |
| Deepin 23 | 🟡 社区支持 | .deb | 基于 Debian，兼容 |
| UOS 1070 | 🟡 社区支持 | .deb | 统信国产系统 |
| Debian 12 | 🟡 社区支持 | .deb | |
| Fedora 40 | ⚠️ 实验性 | .rpm | RPM 包可用但 CI 未覆盖 |
| Arch Linux | 🟢 AUR | AUR | 社区维护 |

## 系统依赖

### Ubuntu/Debian/Deepin/UOS

```bash
sudo apt install -y \
  libwebkit2gtk-4.1-0 \
  libgtk-3-0 \
  libayatana-appindicator3-1 \
  librsvg2-2 \
  libdbus-1-3
```

### 输入法支持

纪程使用 Tauri 框架，默认支持 fcitx5 和 ibus 输入法。

**fcitx5（推荐，Deepin/UOS 默认）：**
```bash
# Deepin/UOS 预装 fcitx5，无需额外配置
```

**ibus（Ubuntu 默认）：**
```bash
# Ubuntu 预装 ibus，无需额外配置
```

### 字体

纪程使用系统字体栈（`font-family: system-ui, -apple-system, sans-serif`），自动适配各发行版：
- Deepin: Noto Sans CJK SC
- UOS: Noto Sans CJK SC / 文泉驿
- Ubuntu: Ubuntu font

## DPI 与高分辨率

Tauri 原生支持 HiDPI。在 Deepin/UOS 上：

- 设置 → 显示 → 缩放率 → 1.25x 或 1.5x
- 纪程自动跟随系统 DPI 缩放

## 系统托盘

纪程使用 `libayatana-appindicator3` 提供系统托盘图标。

```bash
# Deepin/UOS
sudo apt install libayatana-appindicator3-1

# 某些 Deepin 版本需要额外启用系统托盘
# 控制中心 → 通知 → 系统托盘 → 启用
```

## 已知问题

### Deepin 23

1. **窗口模糊**：某些 Deepin 主题下标题栏可能不跟随系统主题。当前使用默认 Tauri 标题栏。
2. **文件对话框**：Deepin 的文件选择器（DFileDialog）可能在某些版本下显示异常。可使用 Tauri 的原生文件对话框替代。

### UOS 1070

1. **安全中心拦截**：UOS 安全中心可能拦截未签名的 AppImage。解决方案：
   ```bash
   # 添加执行权限
   chmod +x 纪程_*.AppImage
   # 如被拦截，在安全中心 → 应用安全 → 自定义 → 添加例外
   ```
2. **DConf 权限**：UOS 默认开启 DConf 权限管控，可能影响应用设置存储。纪程使用标准 Tauri 配置路径（`~/.config/com.pzmmy.jicheng/`），通常不受影响。

### Arch Linux

AUR 包由社区维护，安装前请检查 PKGBUILD。

## 测试清单

在 Deepin/UOS 上验证以下功能：

- [ ] 安装（.deb / AppImage）
- [ ] 启动（首次 + 后续）
- [ ] 中文输入（fcitx5/ibus）
- [ ] 打开/关闭仓库
- [ ] 分支切换
- [ ] Commit + Push
- [ ] Gitee PR 操作
- [ ] AI 功能（DeepSeek）
- [ ] 系统托盘
- [ ] 文件对话框
- [ ] 窗口缩放
- [ ] 字体渲染
- [ ] 设置面板各功能
