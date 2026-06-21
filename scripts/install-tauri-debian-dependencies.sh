#!/bin/bash
# 安装 Tauri Debian 构建依赖
# 用途: 安装 Tauri 在 Linux 上编译所需的系统库（webkit2gtk、appindicator、openssl 等）
# 用法: ./scripts/install-tauri-debian-dependencies.sh
# 要求: apt, sudo 权限
# 示例: sudo bash scripts/install-tauri-debian-dependencies.sh

set -eu -o pipefail

# Install the dependencies needed to build tauri, mainly.
apt update
apt install libwebkit2gtk-4.1-dev \
            build-essential \
            curl \
            wget \
            file \
            libxdo-dev \
            libssl-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            cmake
