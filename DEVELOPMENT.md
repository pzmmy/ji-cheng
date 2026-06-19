# 如何参与纪程开发

好的，你想开始编译了。我们已经爱上你了。你的父母把你教育得很好。让我们开始吧。

---

## 目录

- [概述](#概述)
- [仅 CLI 开发](#仅-cli-开发)
- [基础入门](#基础入门)
  - [前置条件](#前置条件)
  - [安装依赖](#安装依赖)
  - [运行应用](#运行应用)
  - [代码检查与格式化](#代码检查与格式化)
- [调试](#调试)
  - [日志](#日志)
  - [仓库](#仓库)
  - [Tokio](#tokio)
- [故障排除](#故障排除)
- [构建](#构建)
  - [在 Windows 上构建](#在-windows-上构建)
    - [文件权限](#文件权限)
    - [Perl](#perl)
    - [交叉编译](#交叉编译)
- [设计](#设计)
- [贡献](#贡献)
- [其他随机笔记](#其他随机笔记)
  - [图标生成](#图标生成)
  - [发布](#发布)
  - [版本管理](#版本管理)
  - [发布流程](#发布流程)
- [开发模式 OAuth 登录](#开发模式-oauth-登录)
- [加入纪程团队](#加入纪程团队)

---

## 概述

那么，这整个项目是如何运作的呢？

这是一个 [Tauri 应用](https://tauri.app/)，类似于 Electron 应用，我们可以从同一份源码开发桌面应用，支持多个操作系统目标，并用 HTML 和 Javascript 编写 UI。不过，在文件系统访问部分，Tauri 使用 [Rust](https://www.rust-lang.org/) 而不是 Node。

因此，所有涉及磁盘操作的部分使用 Rust，用户看到的所有内容使用 HTML/JS。具体来说，我们使用 [Svelte](https://svelte.dev/)（TypeScript）来实现这一层。

有关架构的深入解读，请参见 [DEEPWIKI](https://deepwiki.com/gitbutlerapp/gitbutler)。

---

## 仅 CLI 开发

最简单的入门方式是参与 `but` CLI 的开发。

你只需要安装 Rust……[^cli-build-prereqs]

```bash
$ cd gitbutler-repo
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

……然后构建并运行 CLI：

```bash
$ cargo build -p but
$ cargo run -p but -- --help
$ cargo run -p but -- -C /path/to/git-repo status
```

仅测试 CLI：

```bash
$ cargo test -p but
```

源码树中的有用位置：

- `crates/but/src/args` — CLI 参数解析和帮助文本
- `crates/but/src/command` — 命令实现
- `crates/but/tests` — 集成测试

[^cli-build-prereqs]:
    实际上，`cargo build -p but` 也会构建原生依赖，例如 `git2`（使用 vendored 的 `openssl` 和 `libgit2`），因此你仍然需要可用的 C 工具链。在 Linux 上，通常需要 `build-essential`、`make`、`perl`、`cmake` 和 `pkg-config` 等工具；在 macOS 上，安装 Xcode Command Line Tools。在 Windows 上，你需要可用的基于 MSVC 的工具链及相关原生依赖；详情请参见下方的 [在 Windows 上构建](#在-windows-上构建)（包括 `openssl-sys` 所需的 `perl`）。如果你已经完成了 [基础入门](#基础入门) 中的桌面端前置条件，你就已经完成了更严格的配置。

## 基础入门

好的，让我们把它跑起来。

### 前置条件

首先，这是一个 Tauri 应用，后端使用 Rust，前端使用 Javascript。请确保你已经安装了所有前置条件。

1. Tauri 开发依赖（https://tauri.app/start/prerequisites/#system-dependencies）

在 Mac OS 上，确保已安装 XCode 和 `cmake`。在 Linux 上，如果你使用的是 Debian 或其衍生版（如 Ubuntu），可以使用以下命令。

<details>
<summary>Linux Tauri 依赖</summary>

```bash
$ sudo apt update
$ sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  cmake
```

</details>

2. Rust

对于 Mac OS 和 Linux，你可以使用以下 `rustup` 快速安装脚本获取所有必要工具。

```bash
$ cd gitbutler-repo
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

3. Node

接下来，确保你至少安装了 Node 20。如果你在 Mac OS 或 Linux 上缺少 `node`，可以使用你喜欢的包管理器，如 `brew` 或 `apt`。

或者，你也可以使用 Vercel 的 Node 安装程序来获取最新版本。

```bash
$ curl https://install-node.vercel.app/latest > install_node.sh
$ sudo ./install_node.sh
```

4. pnpm

最后，我们使用 `pnpm` 作为 Javascript 包管理器。你可以利用 `node` 自带的 `corepack` 来安装并使用 `package.json` 中定义的 pnpm 版本。

```bash
$ cd gitbutler-repo
$ corepack enable
```

### 安装依赖

接下来，安装应用依赖。

希望你还有足够的磁盘空间容纳 300M 的 `node_modules`，因为这个家伙会把它塞满：

```bash
$ pnpm install # 现在它会要求你通过 corepack 确认下载、安装和使用 pnpm
```

当我们的依赖发生变化时，你需要偶尔重新运行此命令。

> [!NOTE]  
> 我们使用 [turborepo](https://turbo.build/repo) 作为我们的 monorepo 工具，默认情况下 Vercel 会收集一些[基本遥测数据](https://turbo.build/repo/docs/telemetry)。如果你想禁用它，请在安装依赖后在项目根目录运行 `pnpm exec turbo telemetry disable`。

### 运行应用

首先，运行 cargo build，以便创建辅助二进制文件（如 `gitbutler-git-askpass`）（注意：默认文件夹（`target`）将用于构建）：

```bash
$ cargo build
```

现在你应该可以在开发模式下运行应用：

```bash
$ pnpm dev:desktop
```

默认情况下，它不会在控制台打印 debug 日志。如果你需要 debug 日志，请设置 `LOG_LEVEL` 环境变量：

```bash
$ LOG_LEVEL=debug pnpm dev:desktop
```

### 代码检查与格式化

为了让 PR 被接受，你需要确保通过所有的代码检查。因此，请在提交前运行以下命令。我们的 CI 会在你没做的时候让你难堪的。

Javascript：

```bash
$ pnpm lint
$ pnpm format
```

Rust：

```bash
$ cargo clippy   # 查看 lint 错误
$ cargo fmt      # 格式化代码
```

---

## 调试

现在你已经让应用运行起来了，这里有一些调试提示，帮助你处理正在开发的内容。

### 日志

应用将日志写入：

1. 开发模式下的 `stdout`
2. Tauri 的[日志](https://tauri.app/v1/api/js/path/#platform-specific)目录

可以在本地启动应用时获取性能日志，方法如下：

```bash
GITBUTLER_PERFORMANCE_LOG=1 LOG_LEVEL=debug pnpm tauri dev
```

要获得更真实的性能日志，请使用带 `--release` 的本地 release 构建。

```bash
GITBUTLER_PERFORMANCE_LOG=1 LOG_LEVEL=debug pnpm tauri dev --release
```

### 仓库

行为通常取决于当前上下文：即正在显示的仓库。除了_日志_之外，了解其结构也很有用。

为此，请_从终端启动应用程序_，方式如上文段落所示（或正下方所示），但需要安装 `graphviz`。`dot` 程序应位于 `PATH` 中，以便从终端运行。

例如，在 MacOS 上可以这样操作：

###### 稳定版构建

```shell
GITBUTLER_PERFORMANCE_LOG=1 /Applications/GitButler/Contents/MacOS/gitbutler-tauri
```

###### 夜间版构建

```shell
GITBUTLER_PERFORMANCE_LOG=1 /Applications/GitButler\ Nightly.app/Contents/MacOS/gitbutler-tauri
```

###### 生成 commit-graph 可视化

然后，在应用程序中，在任何不可编辑的 GUI 区域输入 `dot`，就像输入秘籍代码一样。这将弹出一个 SVG 版本的图形，纪程用它来创建工作区投影。

### Tokio

我们也在收集 tokio 的运行时跟踪信息，可以使用 [tokio-console](https://github.com/tokio-rs/console#tokio-console-prototypes) 查看：

- 开发模式：
  ```bash
  $ tokio-console
  ```
- 夜间版：
  ```bash
  $ tokio-console http://127.0.0.1:6668
  ```
- 生产版：
  ```bash
  $ tokio-console http://127.0.0.1:6667
  ```

---

## 故障排除

开发纪程时的常见问题及解决方案。

### Turbo/构建问题

#### 大小写敏感卷问题

如果你在 macOS 上遇到 `dev:desktop` 目标无法启动的问题，尤其是在大小写敏感的文件系统上，这可能与 Turborepo 处理大小写敏感卷的方式有关。

**解决方案：** 参见相关 issue [vercel/turborepo#8491](https://github.com/vercel/turborepo/issues/8491) 了解当前的解决方法。

#### Turbo daemon 问题

如果构建挂起或行为异常：

```bash
# 停止 turbo daemon
pnpm exec turbo daemon stop

# 清除 turbo 缓存
pnpm exec turbo daemon clean

# 重新启动开发
pnpm dev:desktop
```

### 缓存问题

如果你遇到过时构建或意外行为：

```bash
rm -rf .turbo node_modules
pnpm install
# 可选（Rust 构建产物）：
cargo clean
```

### Node.js 与 pnpm

使用 `.nvmrc` 锁定的 Node 版本（当前为 LTS "jod" / Node 22）：

```bash
nvm install
nvm use
node -v
```

通过 Corepack 使用 pnpm（避免全局安装）：

```bash
corepack enable
corepack pnpm -v
# 可选地锁定主版本：
corepack prepare pnpm@10 --activate
```

### 其他资源

针对我们工具链组件的特定问题：

- [Turborepo issues](https://github.com/vercel/turborepo/issues)
- [Tauri issues](https://github.com/tauri-apps/tauri/issues)

如果上述解决方案都不奏效，请查看我们的 [GitHub Issues](https://github.com/gitbutlerapp/gitbutler/issues) 或创建一个新 issue，并提供详细的系统和错误信息。

---

## 构建

要以生产模式构建应用，请运行：

```bash
$ pnpm tauri build --features devtools,builtin-but,disable-auto-updates --config crates/gitbutler-tauri/tauri.conf.nightly-local.json
```

这将生成类似于我们夜间版的构建产物。

### 在 Windows 上构建

在 Windows 上构建是一个有点棘手的过程。以下是一些有用的提示。

#### 文件权限

我们使用 `pnpm`，它需要相对较新的 Node.js 版本。请确保安装了最新的稳定版 Node.js 并已加入 PATH，然后运行 `npm install -g pnpm`。

有时 npm 的 prefix 在 Windows 上不正确，我们可以通过以下方式检查：

```sh
npm config get prefix
```

如果它不是 `C:\Users\<用户名>\AppData\Roaming\npm` 或其他通常可写的文件夹，则可以在 Powershell 中设置：

```sh
mkdir -p $APPDATA\npm
npm config set prefix $env:APPDATA\npm
```

之后，将此文件夹加入你的 PATH。

#### Perl

需要安装 Perl 解释器才能配置 `openssl-sys` crate。我们使用 [Strawberry Perl](https://strawberryperl.com/) 没有问题。请确保已安装且 `perl` 在 `PATH` 中可用（安装后默认即可，只需确保安装后重启终端）。[Scoop](https://scoop.sh/) 用户可以通过 `scoop install perl` 安装。

请注意，构建可能看起来在 `openssl-sys` crate 上挂起或冻结了。其实没有，只是 Cargo 无法报告底层 C/C++ 构建的状态，而且 openssl _很大_。编译需要一些时间。

#### OpenSSL

要构建它，需要导出要使用的 Perl 安装路径。以下命令在 git-bash 中可以完成。

```bash
export OPENSSL_SRC_PERL="c:/Strawberry/perl/bin/perl.exe"
```

要使此更改永久生效，可以将此更改（及其他更改）添加到 `~/.bash_profile`。

```bash
echo 'export OPENSSL_SRC_PERL="c:/Strawberry/perl/bin/perl.exe"' >> ~/.bash_profile
```

#### 交叉编译

本节讨论从 ARM Windows 交叉编译到 x86_64-MSVC，这是使用 Apple Silicon 和 Parallels VM 的用户的典型配置，这些 VM 只允许使用 ARM Windows。

`gitbutler-git` 上的 `windows` 依赖目前无法在 ARM 上编译，这意味着需要交叉编译到 x86-64 来解决这个问题。此外，大多数用户可能仍然使用 INTEL 机器，使得这项能力成为常见需求。

在 Git `bash` 中（_系统已安装 x86-64 的 MSVC_），运行以下命令来准备环境。

```bash
export TRIPLE_OVERRIDE=x86_64-pc-windows-msvc
export CARGO_BUILD_TARGET=x86_64-pc-windows-msvc
# 为了保险起见
export OPENSSL_SRC_PERL="c:/Strawberry/perl/bin/perl.exe"
```

以下是生成夜间 release 构建的方法：

```
pnpm tauri build --features windows,devtools --config  crates/gitbutler-tauri/tauri.conf.nightly.json
```

而这是获取本地开发者 debug 构建的方法：

```bash
pnpm tauri dev --features windows --target x86_64-pc-windows-msvc
```

请注意，必须重复 `--target` 指定，否则最终的复制操作（由 `tauri` 触发）将无法正常工作。

---

## 设计

我们使用 [Figma](https://www.figma.com/) 进行设计工作。如果你是一名设计师（即使不是），想要为纪程的设计做贡献，或者你的工作涉及 UI，你可以复制我们的设计文件。

纪程设计：[Figma 文件](https://www.figma.com/file/FbeLt0yjY9RiNn8MXUXsYs/Client-Design?type=design&node-id=0%3A1&mode=design&t=MUDQhR3iOM3DpI9m-1) 🎨

---

## 贡献

现在你已经成功运行起来了，如果你想做些修改并为我们提交 PR，请务必阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，以确保没有浪费时间。

---

## 其他随机笔记

这些大多为纪程内部使用，但也许其他人也会觉得有趣。

---

### 图标生成

我总是忘记怎么做，但当我们更新应用图标时，运行以下命令来导入它。

```bash
$ pnpm tauri icon path/to/icon.png
```

### 发布

构建通过 [GitHub Action](https://github.com/gitbutlerapp/gitbutler/actions/workflows/publish.yaml) 完成。访问链接并从所需分支选择 `Run workflow`。

### 版本管理

运行[发布 action](https://github.com/gitbutlerapp/gitbutler/actions/workflows/publish.yaml) 时，你需要选择 `major`、`minor` 或 `patch` 发布类型。Action 将根据你的输入和 `https://app.gitbutler.com/releases` 上的当前版本生成新版本。

### 发布流程

要发布刚刚构建的版本，请使用 [Release Manager](https://gitbutler.retool.com/apps/cb9cbed6-ae0a-11ed-918c-736c4335d3af/Release%20Manager)。

---

## 开发模式 OAuth 登录

默认情况下，你将无法使用 Github/Google 登录纪程，因为基础 URL 不匹配。要实现此功能，请在 `.env.development` 文件中添加（或更新）以下行。如果文件不存在，你需要创建它。

```
PUBLIC_API_BASE_URL=https://app.gitbutler.com/
```

桌面前端和本地后端都遵循 `PUBLIC_API_BASE_URL`。如果在调试时需要仅后端的覆盖配置，`GITBUTLER_API_URL` 在 Rust 端仍然具有更高优先级。

当你使用 `pnpm dev:desktop` 启动桌面应用时，Tauri 启动器现在也会将 `apps/desktop/.env`、`.env.local`、`.env.development` 和 `.env.development.local` 加载到 Rust 进程中，因此前端和后端默认看到相同的本地覆盖配置。

---

## 加入纪程团队

如果你有兴趣加入我们小而紧密的工程团队，我们目前正在招聘以下岗位：

- [高级 Rust 开发工程师](https://jobs.gitbutler.com/jobs/backend-rust)（旧金山、柏林或远程）
- [高级 TypeScript 开发工程师](https://jobs.gitbutler.com/jobs/frontend-typescript)（旧金山、柏林或远程）
- [Gerrit 开发工程师](https://jobs.gitbutler.com/jobs/gerrit-developer)（旧金山、柏林或远程）

## 代码清理清单

以下是我们希望消除或拆分为更小 crate 的 crate/模块列表：

- [gitbutler-reference](crates/gitbutler-reference/)（质量较差）
- [gitbutler-branch-actions](crates/gitbutler-branch-actions/)（包含虚拟分支领域之外的功能，如 commit 操作等）
- [gitbutler-branch](crates/gitbutler-branch/)（由于循环依赖，包含 `diff` 和 `branch` 上下文）
- [gitbutler-url](crates/gitbutler-url/)（非常混乱，理想情况下我们完全不需要它）
- [gitbutler_repo::config](crates/gitbutler-repo/src/config.rs)（似乎是错误的抽象）
