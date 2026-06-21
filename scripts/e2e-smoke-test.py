#!/usr/bin/env python3
"""
Smoke test: verify built frontend loads without console errors.

Usage: python3 scripts/e2e-smoke-test.py

Requires: playwright (pip install playwright) + chromium installed
The frontend must be built first (pnpm build:desktop)
"""

import subprocess
import time
import signal
import sys
import os

BUILD_DIR = os.path.abspath("apps/desktop/build")
PORT = 4173
TIMEOUT = 10  # seconds to wait for page load

def main():
    if not os.path.exists(os.path.join(BUILD_DIR, "index.html")):
        print(f"❌ 前端构建产物不存在: {BUILD_DIR}")
        print("   请先运行: CI=true pnpm build:desktop")
        sys.exit(1)

    print(f"🔍 启动本地服务器 (端口 {PORT})...")
    server = subprocess.Popen(
        ["npx", "serve", BUILD_DIR, "-p", str(PORT), "--no-clipboard"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(2)

    try:
        print(f"🌐 打开浏览器访问 http://localhost:{PORT}")
        from playwright.sync_api import sync_playwright

        errors_caught = []

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            page.on("console", lambda msg: errors_caught.append({
                "type": msg.type,
                "text": msg.text,
            }) if msg.type == "error" else None)
            page.on("pageerror", lambda err: errors_caught.append({
                "type": "pageerror",
                "text": str(err),
            }))

            page.goto(f"http://localhost:{PORT}", wait_until="networkidle")
            time.sleep(2)

            # Filter out expected errors:
            # - Tauri platform API not available in standalone browser
            # - sourcemap warnings from dev builds
            # - favicon 404s
            KNOWN_PATTERNS = [
                "sourcemap", "favicon",
                # Tauri-specific: backend tries to access window.__TAURI_* which
                # only exists inside the Tauri runtime, not in standalone browser
                "__TAURI_",
                "tauri://",
                "cannot read properties of undefined (reading 'platform')",
            ]
            real_errors = [
                e for e in errors_caught
                if not any(p in e["text"].lower() for p in KNOWN_PATTERNS)
            ]

            browser.close()

        if real_errors:
            print(f"❌ 发现 {len(real_errors)} 个控制台错误:")
            for e in real_errors:
                print(f"   [{e['type']}] {e['text'][:200]}")
            sys.exit(1)
        else:
            print(f"✅ 页面加载成功，无控制台错误")
            print(f"   共捕获 {len(errors_caught)} 个非关键消息")

    except ImportError:
        print("❌ 需要 playwright 库。安装: pip install playwright")
        print("   然后: playwright install chromium")
        sys.exit(1)
    finally:
        server.send_signal(signal.SIGTERM)
        server.wait(timeout=5)


if __name__ == "__main__":
    main()
