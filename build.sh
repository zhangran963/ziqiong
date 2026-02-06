#!/bin/bash
set -e # 遇到错误立即停止执行

echo "=== [DEBUG] Starting Build Process ==="
echo "Current User: $(whoami)"
echo "Current Directory: $(pwd)"
echo "PATH: $PATH"

# 1. 尝试激活 Cloudflare 预装的 Rust
echo "=== [DEBUG] Activating Rust Environment ==="
if [ -f "$HOME/.cargo/env" ]; then
    echo "Found $HOME/.cargo/env, sourcing it..."
    source "$HOME/.cargo/env"
else
    echo "Warning: $HOME/.cargo/env not found."
fi

# 2. 强制补全 PATH
export PATH="$HOME/.cargo/bin:$PATH"
echo "Updated PATH: $PATH"

# 3. 检查 rustc 是否可用
echo "=== [DEBUG] Checking Toolchains ==="
if command -v rustc &> /dev/null; then
    echo "Rustc found: $(rustc --version)"
    echo "Cargo found: $(cargo --version)"
else
    echo "Rustc NOT found. Attempting manual install..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "Manual install finished. Rustc: $(rustc --version)"
fi

# 4. 安装 wasm-pack 并检查
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
else
    echo "wasm-pack already exists: $(wasm-pack --version)"
fi

# 5. 检查 Node/NPM 环境
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "=== [DEBUG] Pre-build Check Finished. Starting npm run build ==="
npm run build