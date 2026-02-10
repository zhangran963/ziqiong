# 图片预览项目

基于 Cloudflare Pages + R2 的图片展示应用，支持响应式瀑布流布局。

## ✨ 特性

- 🎨 **响应式瀑布流布局** - 适配 PC、平板、手机三端
- 🖼️ **预生成缩略图** - Sharp 处理，300px @ 90% JPEG 质量
- ⚡ **性能优化** - 平均 25.9KB，压缩率 89.5%
- 📤 **在线上传** - 支持拖拽上传，自动生成缩略图
- 🔐 **密码保护** - 上传功能密码保护
- 🌐 **Cloudflare 托管** - Pages + R2，全球 CDN 加速

## 📦 技术栈

- **前端**: Vue 3 + Vite + UnoCSS
- **后端**: Cloudflare Pages Functions
- **存储**: Cloudflare R2
- **图片处理**: Sharp (Node.js)

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量（首次使用）
cp .env.example .env
# 编辑 .env，设置 UPLOAD_PASSWORD

# 启动开发服务器
npm run dev

# 访问
# http://localhost:8788       - 首页（图片展示）
# http://localhost:8788/upload - 上传页面
```

## 📤 使用上传功能

1. 访问 `/upload` 页面
2. 输入上传密码（`.env` 中配置的 `UPLOAD_PASSWORD`）
3. 拖拽或选择图片
4. 系统自动：
   - 提取图片宽高
   - 生成 300px 缩略图
   - 上传原图 + 缩略图到 R2
   - 添加 Custom Metadata

## 🏗️ 构建和部署

```bash
# 一键构建并部署
npm run deploy
```

- 构建产物在 `dist/`，部署目标为 Cloudflare Pages。
- 若出现 `fetch failed`，多为网络/代理问题，可换网络或关闭 VPN 后重试。
- **部署后** 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages → 项目 → **Settings** → **Environment variables** 添加：
  - `UPLOAD_PASSWORD` = 你的上传密码

## 🖼️ 缩略图生成

```bash
# 生成所有缩略图
npm run thumbnail

# 生成指定文件夹的缩略图
npm run thumbnail:lyrics
```

详见：[THUMBNAIL_SETUP.md](./THUMBNAIL_SETUP.md)

## 📚 文档

- [开发指南](./DEVELOPMENT.md)
- [缩略图设置](./THUMBNAIL_SETUP.md)
- [快速开始](./QUICKSTART_THUMBNAILS.md)
- [图片优化说明](./IMAGE_OPTIMIZATION.md)

## 📝 License

MIT
