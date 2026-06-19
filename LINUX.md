# Linux 兼容性

纪程应该在大多数现代 Linux 发行版上运行良好，但软件和硬件的组合太多，核心团队无法独自支持所有情况。因此，纪程项目为少数精选的 Linux 发行版提供官方支持，其余则依赖社区维护的软件包。

本文档概述了当前对 Linux 发行版和打包格式的支持承诺。

> 关于 Linux 兼容性当前状态的更动态概述，请参见 https://github.com/gitbutlerapp/gitbutler/issues/8411

## 官方支持

官方支持的安装方式是使用[下载页面](https://gitbutler.com/downloads)提供的 `deb` 包。该包定期经过测试，确保在以下发行版上运行良好。

- Ubuntu 22.04 LTS (jammy)
- Ubuntu 24.04 LTS (noble)

在这些发行版上，我们的目标是提供与 Windows 和 macOS 一样良好的用户体验。兼容性会例行验证，兼容性问题由纪程核心团队负责处理。我们知道当前的用户体验在某些方面还不够完善，改进工作正在进行中。

这并不意味着纪程项目不关心其他 Linux 发行版的问题。我们欢迎在[问题追踪器](https://github.com/gitbutlerapp/gitbutler/issues)中报告_任何_发行版的兼容性问题，但请注意，此类问题不保证会很快获得优先级处理。如果需要做出兼容性权衡，始终会优先考虑官方支持的发行版。

## 实验性分发：`rpm`

我们随 `deb` 包一起提供实验性的 `rpm` 包。它与 `deb` 包本质上相同，应该具有相同的兼容性水平，但在开发过程中并未在任何发行版上进行定期测试。我们之所以提供它，是因为在当前工具链下构建它并不需要额外的工作，而且我们没有理由相信它会带来任何特殊的兼容性问题。

## 实验性分发：AppImage

我们提供一个实验性的 AppImage，它绑定了运行纪程所需的核心依赖。其意图是在大多数 Linux 发行版上都能工作，但经验表明兼容性相对较差。

如果兼容性仍然不佳，未来可能会移除 AppImage。

## 社区维护的分发

有几种社区维护的纪程分发版本。这些分发版本的问题通常应向各自维护者报告。

> 知道我们遗漏了某个分发渠道？提交 PR 让我们知道！

- Arch Linux 用户仓库 (AUR)
  - [gitbutler](https://aur.archlinux.org/packages/gitbutler)
  - [gitbutler-bin](https://aur.archlinux.org/packages/gitbutler-bin)
- Flatpak
  - [GitButler](https://flathub.org/en/apps/com.gitbutler.gitbutler)
- Nix
  - [stable](https://search.nixos.org/packages?query=gitbutler&show=gitbutler)
  - [unstable](https://search.nixos.org/packages?channel=unstable&query=gitbutler&show=gitbutler)

## 已知问题及解决方法

### WebKitGTK 线程中的高 CPU 使用率

如果你在 WebKit 相关线程中表现出高 CPU 使用率，请尝试禁用 WebKitGTK 的硬件加速。

```bash
$ WEBKIT_DISABLE_COMPOSITING_MODE=1 gitbutler-tauri
```

详情请参见 https://github.com/gitbutlerapp/gitbutler/issues/11602。

### NVIDIA GPU 下出现黑屏或崩溃

NVIDIA 专有驱动与 WebKitGTK 之间存在已知的不兼容问题，可能导致从黑屏到立即崩溃的各种问题。这些问题在 Wayland 上最为常见。

已知错误包括：

- `KMS: DRM_IOCTL_MODE_CREATE_DUMB failed: Permission denied`
  - 通常导致黑屏
- `Error 71 (Protocol error) dispatching to Wayland display`
  - 通常导致立即崩溃
  - 仅在使用环境变量 `WAYLAND_DEBUG=1` 运行时可见

可以尝试以下几种解决方法：

- 使用 `__NV_DISABLE_EXPLICIT_SYNC=1` 禁用 Explicit Sync
  - 如果此方法有效，这是目前已知的最佳解决方案，因为它仍然允许应用使用你的 GPU
- 使用 `WEBKIT_DISABLE_COMPOSITING_MODE=1` 禁用硬件加速
  - 通常是最稳定的解决方案
  - 应用_不会_在你的 GPU 上运行，可能导致性能下降
- 使用 Nouveau 驱动代替 NVIDIA 专有驱动
- 使用 [PRIME offloading](https://wiki.archlinux.org/title/PRIME) 让纪程运行在你的 iGPU 上
  - 由于性能问题，你可能仍然需要禁用硬件加速

详情请参见 https://github.com/gitbutlerapp/gitbutler/issues/11761。

### NVIDIA GPU 下的文字模糊问题

已知 NVIDIA 驱动会因 FXAA 导致 WebKitGTK 应用中的文字模糊。

可以尝试的解决方法：

- 使用 `WEBKIT_DISABLE_COMPOSITING_MODE=1` 禁用硬件加速
  - 通常是最稳定的解决方案
  - 应用_不会_在你的 GPU 上运行，可能导致性能下降
- 在 NVIDIA 设置中禁用 FXAA
- 使用 Nouveau 驱动代替 NVIDIA 专有驱动

详情请参见 https://github.com/gitbutlerapp/gitbutler/issues/12971。
