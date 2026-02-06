#!/bin/bash

# 1. 核心：显式加载 Rust 环境（这是云端构建成功的命门）
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# 2. 强制补齐路径，防止 source 没起作用
export PATH="$HOME/.cargo/bin:$PATH"

# 3. 验证环境并安装 wasm-pack
echo "Checking Rust environment..."
rustc --version || echo "Rust not found"

if ! command -v wasm-pack &> /dev/null; then
  echo "Installing wasm-pack..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# 4. 执行 package.json 中的 build 逻辑
npm run build