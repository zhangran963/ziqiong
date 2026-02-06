#!/bin/bash
# 必须先将 Rust 路径加入环境，否则云端找不到 cargo 命令
export PATH="$HOME/.cargo/bin:$PATH"

# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 执行 package.json 中的 build 逻辑
npm run build