# 📤 图片上传功能使用指南

## 🎯 功能特性

✅ **密码保护** - 防止未授权上传  
✅ **拖拽上传** - 支持拖拽文件到上传区  
✅ **自动缩略图** - 前端生成 300px @ 90% JPEG 缩略图  
✅ **元数据存储** - 自动提取并存储图片宽高和创建时间  
✅ **文件验证** - 类型、大小检查  
✅ **进度显示** - 实时上传进度

## 🚀 使用步骤

### 1️⃣ 访问上传页面

```
http://localhost:8788/upload  (本地开发)
https://your-domain.pages.dev/upload  (生产环境)
```

### 2️⃣ 输入上传密码

- 本地开发：密码在 `.env` 文件中配置
- 生产环境：密码在 Cloudflare Dashboard 配置

```env
UPLOAD_PASSWORD=your-secure-password
```

### 3️⃣ 选择或拖拽图片

支持两种方式：
- 点击上传区选择文件
- 拖拽图片到上传区

**限制：**
- 格式：JPG、PNG、WebP
- 大小：最大 10MB

### 4️⃣ 预览和上传

系统会自动：
1. ✅ 显示图片预览
2. ✅ 提取图片尺寸（宽 × 高）
3. ✅ 显示文件大小
4. ✅ 生成缩略图（300px 宽，质量 90%）
5. ✅ 上传原图 + 缩略图到 R2
6. ✅ 添加自定义元数据

### 5️⃣ 查看结果

上传成功后，系统会显示：
- ✅ 上传成功消息
- 📁 保存的文件路径
  - `lyrics/your-image.jpg` (原图)
  - `lyrics/your-image_thumb.jpg` (缩略图)

## 📂 文件存储结构

```
R2 存储桶 (duan)
└── lyrics/
    ├── photo1.jpg          # 原图
    ├── photo1_thumb.jpg    # 缩略图
    ├── photo2.png          # 原图
    └── photo2_thumb.png    # 缩略图
```

## 🔧 元数据字段

每个上传的图片都包含以下元数据：

| 字段 | 说明 | 示例 |
|------|------|------|
| `user-width` | 图片宽度 | `1920` |
| `user-height` | 图片高度 | `1080` |
| `user-original-time` | 创建时间 | `2026-02-10T11:00:00.000Z` |
| `uploaded-by` | 上传来源 | `web-upload` |

## 🔐 生产环境配置

### 在 Cloudflare Dashboard 配置密码

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → 选择项目 `ziqiong`
3. **Settings** → **Environment variables**
4. 点击 **Add variable**
   - Name: `UPLOAD_PASSWORD`
   - Value: `your-secure-password`
5. 保存并重新部署

### 修改上传文件夹

编辑 `src/views/upload/index.vue`:

```javascript
// 修改这一行
formData.append('folder', 'lyrics'); // 改为你想要的文件夹名
```

## 🎨 自定义配置

### 修改缩略图质量

编辑 `src/views/upload/index.vue`，找到 `generateThumbnail` 函数：

```javascript
const thumbnailBlob = await generateThumbnail(
  selectedFile.value,
  300,  // 宽度（像素）
  0.9   // 质量（0-1）
);
```

### 修改文件大小限制

编辑 `functions/api/upload/index.js`:

```javascript
// 当前限制 10MB
const maxSize = 10 * 1024 * 1024; // 修改此值
```

### 修改支持的文件类型

编辑 `functions/api/upload/index.js`:

```javascript
const validTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
  // 添加更多类型
];
```

## ⚠️ 注意事项

1. **密码安全**
   - 使用强密码
   - 定期更换密码
   - 不要将密码提交到 Git

2. **文件名处理**
   - 系统会自动清理不安全字符
   - 保留中文、字母、数字、点、下划线、连字符
   - 其他字符会被替换为下划线

3. **R2 费用**
   - 免费额度：10GB 存储，每月 100 万次 Class A 操作
   - 超出部分按量计费
   - 详见 [Cloudflare R2 定价](https://developers.cloudflare.com/r2/pricing/)

4. **浏览器兼容性**
   - 需要支持 Canvas API
   - 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 🐛 常见问题

### Q: 密码总是错误？

**A:** 检查以下几点：
- 本地开发：确认 `.env` 中的密码
- 生产环境：确认 Cloudflare Dashboard 中的环境变量
- 检查是否有多余的空格

### Q: 上传后首页没显示？

**A:** 需要刷新首页。未来可以添加自动刷新功能。

### Q: 缩略图质量太差？

**A:** 调整 `generateThumbnail` 函数的参数：
- 增加宽度：`300` → `400`
- 提高质量：`0.9` → `0.95`

### Q: 能批量上传吗？

**A:** 当前版本仅支持单文件上传。批量上传需要扩展功能。

## 📚 相关文档

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## 🎉 完成！

现在你可以：
1. 在本地开发环境测试上传功能
2. 部署到生产环境
3. 通过 `/upload` 页面上传图片
4. 在首页看到新上传的图片

祝使用愉快！📸
