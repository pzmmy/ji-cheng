# Windows 代码签名指南

## 为什么要签名
Windows 对未签名的 `.msi` 安装包会显示「Windows 已保护你的电脑」警告。
签名后显示正常的发布者信息，大幅降低用户安装阻力。

## 获取签名证书

| 途径 | 费用 | 说明 |
|------|------|------|
| 个人代码签名证书 | ¥500-1000/年 | 沃通、天威诚信等 CA 机构 |
| 企业代码签名证书 | ¥2000-5000/年 | 更高级别信任，推荐 |
| Let's Encrypt 不支持 | — | 不支持代码签名 |
| 自签名 | 免费 | 仅适用于内部/测试环境 |

推荐：**沃通个人代码签名证书**（¥600/年），支持 eSigner 云签名（无需硬件 USB Key）。

## 签名流程

### 方式一：本地签名（有证书文件）

```powershell
# 安装 SignTool（随 Windows SDK 或 Visual Studio 安装）
# 通常位于: C:\Program Files (x86)\Windows Kits\10\bin\10.0.xxxxx.0\x64\signtool.exe

# 签名 MSI
signtool sign /fd SHA256 /a /f your-certificate.pfx /p your-password ^
  "target\release\bundle\msi\纪程_0.1.0_x64.msi"

# 验证签名
signtool verify /pa /v "target\release\bundle\msi\纪程_0.1.0_x64.msi"
```

### 方式二：云签名（eSigner / 无 USB Key）

```powershell
# 安装 eSigner 客户端
# 下载: https://www.trustasia.com/esigner

# 使用 eSigner CLI 签名
esigner codesign -f "target\release\bundle\msi\纪程_0.1.0_x64.msi" -t "http://timestamp.digicert.com"
```

### 方式三：GitHub Actions 自动签名

在 Release workflow 中添加：

```yaml
- name: 签名 MSI
  if: runner.os == 'Windows'
  run: |
    echo "${{ secrets.CODE_SIGN_CERT }}" | base64 --decode > cert.pfx
    signtool sign /fd SHA256 /a /f cert.pfx /p "${{ secrets.CODE_SIGN_PASSWORD }}" \
      target/release/bundle/msi/*.msi
  env:
    CODE_SIGN_CERT: ${{ secrets.CODE_SIGN_CERT }}
    CODE_SIGN_PASSWORD: ${{ secrets.CODE_SIGN_PASSWORD }}
```

需在 GitHub Secrets 中配置：
- `CODE_SIGN_CERT` — Base64 编码的 `.pfx` 证书文件
- `CODE_SIGN_PASSWORD` — 证书密码

## 时间戳服务

签名时必须加时间戳，否则证书过期后签名失效：

```
signtool sign /fd SHA256 /a /f cert.pfx /p password /tr "http://timestamp.digicert.com" /td SHA256 app.msi
```

推荐时间戳服务器：
- `http://timestamp.digicert.com`（DigiCert）
- `http://timestamp.sectigo.com`（Sectigo/Comodo）
