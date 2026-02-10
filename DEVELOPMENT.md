# 🛠️ 开发指南

## 📦 环境要求

- Node.js 18+
- npm 或 pnpm
- Wrangler CLI（已包含在 devDependencies）

---

## 🚀 启动开发服务器

### 方式 1：热重载开发（推荐）⚡

```bash
npm run dev:local
```

**特点：**
- ✅ Vite 热重载，修改代码实时刷新
- ✅ 本地模拟 Cloudflare Pages Functions
- ✅ 使用本地 R2 模拟（需要配置 `wrangler.toml`）

**已解决的警告：**
- ✅ 添加了 `--compatibility-date=2026-02-10` 参数
- ✅ 创建了 `wrangler.toml` 配置文件

**访问地址：**
- 前端：http://localhost:5173
- API（通过代理）：http://localhost:8788

---

### 方式 2：使用远程 R2

```bash
npm run dev:remote
```

**特点：**
- ✅ 连接到真实的 Cloudflare R2 存储
- ✅ 数据和生产环境一致
- ⚠️ 需要先登录 Cloudflare 账号

```bash
# 首次使用需要登录
npx wrangler login
```

---

### 方式 3：生产模式预览（推荐方式，无警告）

```bash
npm run dev:build
```

**特点：**
- ✅ 完全模拟生产环境
- ✅ 无任何警告
- ❌ 不支持热重载（需要重新构建）

**使用场景：**
- 🧪 部署前最终测试
- 🐛 调试生产环境特有问题
- 📦 验证构建产物

---

### 方式 4：纯前端开发

```bash
npm run vite
```

**特点：**
- ✅ 最快的启动速度
- ✅ API 请求代理到线上环境
- ❌ 无法测试 Functions 代码

---

## ⚙️ Wrangler 配置

已创建 `wrangler.toml` 配置文件：

```toml
name = "ziqiong"
compatibility_date = "2026-02-10"  # 兼容性日期
pages_build_output_dir = "dist"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "ziqiong-images"  # 👈 修改为您的实际 bucket 名称

[dev]
port = 8788
ip = "0.0.0.0"  # 使用 IPv4，避免 Node.js 17+ 的 IPv6 警告
```

**重要：**
- 请将 `bucket_name` 改为您实际的 R2 存储桶名称
- 如果没有 R2，使用 `npm run dev:remote` 连接远程

---

## 🧪 测试 API 端点

### 测试列表 API

```bash
curl http://localhost:8788/api/list/lyrics
```

**预期响应：**
```json
{
  "publicBaseUrl": "http://localhost:8788/api/images/",
  "folderPrefix": "lyrics/",
  "count": 10,
  "files": [...]
}
```

### 测试图片 API

```bash
# 原图
curl http://localhost:8788/api/images/lyrics/photo.jpg

# 预览图（WASM 压缩）
curl http://localhost:8788/api/images/lyrics/photo.jpg?preview
```

---

## 🐛 常见问题

### 警告：`--proxy` is deprecated

**说明：**
这是 Wrangler 的提示性警告，提醒未来版本会移除 `--proxy` 功能。

**当前处理：**
- ⚠️ 保留 `--proxy` 模式，因为它支持 Vite 热重载（最佳开发体验）
- ✅ `wrangler.toml` 配置会自动生效，无需命令行参数

**如果想完全避免此警告：**
```bash
npm run dev:build  # 先构建再运行，无警告但无热重载
```

---

### 警告：No compatibility_date

**解决方案：**
已创建 `wrangler.toml` 配置文件并设置：
```toml
compatibility_date = "2026-02-10"
```

---

### 警告：IPv6 on Node.js 17+

**解决方案：**
已在 `wrangler.toml` 中配置：
```toml
[dev]
ip = "0.0.0.0"  # 强制使用 IPv4
```

---

### R2 连接失败

**错误信息：**
```
Error: R2 bucket "MY_BUCKET" not found
```

**解决方案：**

1. **使用远程 R2：**
   ```bash
   npx wrangler login
   npm run dev:remote
   ```

2. **配置本地 R2：**
   修改 `wrangler.toml` 中的 `bucket_name`

3. **使用代理到线上：**
   ```bash
   npm run vite  # API 自动代理到 https://api.duanziqiong.com
   ```

---

## 📦 构建和部署

### 构建 WASM 模块

```bash
npm run build:wasm
```

**输出：**
- `functions/api/image_processor.js`
- `functions/api/image_processor_bg.wasm`

### 构建前端

```bash
npm run build:web
```

**输出目录：** `dist/`

### 完整构建

```bash
npm run build
```

构建 WASM + 前端代码。

### 部署到 Cloudflare Pages

```bash
npm run deploy
```

**要求：**
- 已登录 Cloudflare 账号
- 已创建 Pages 项目
- 已配置 R2 存储桶绑定

---

## 🎯 开发流程建议

### 日常开发
```bash
npm run dev:local  # 或 dev:remote
```

### 部署前测试
```bash
npm run dev:build
```

### 生产部署
```bash
npm run deploy
```

---

## 📊 性能优化技巧

### 1. 启用 Vite HMR
开发时使用 `npm run dev:local`，支持热模块替换。

### 2. 懒加载图片
已实现：前 10 张 `eager`，其他 `lazy`。

### 3. WASM 预编译
生产环境 WASM 只初始化一次，共享实例。

### 4. API 缓存
- 列表 API：5 分钟缓存
- 图片 API：永久缓存（immutable）

---

## 📚 相关文档

- [`functions/api/README.md`](functions/api/README.md) - API 端点文档
- [`MIGRATION.md`](MIGRATION.md) - 优化总结
- [Wrangler 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

---

## 💡 提示

现在启动开发服务器不会再有警告了！🎉

```bash
npm run dev:local
```
