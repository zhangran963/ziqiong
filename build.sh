#!/bin/bash
# 安装 wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
# 执行 package.json 里的完整构建
npm run build