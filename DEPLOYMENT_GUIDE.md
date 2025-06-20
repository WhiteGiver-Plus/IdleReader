# PDF阅读器挂机游戏 - 部署指南

## 🚀 部署到公网的方法

### 方法一：Vercel（推荐 - 免费且简单）

1. **准备项目**
   ```bash
   # 确保项目可以正常构建
   npm run build
   ```

2. **部署到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 导入你的GitHub仓库
   - 选择项目目录
   - 点击 "Deploy"

3. **配置环境变量**（如果需要）
   - 在Vercel项目设置中添加环境变量

4. **自动部署**
   - 每次推送到GitHub主分支会自动部署

### 方法二：Netlify（免费且简单）

1. **准备项目**
   ```bash
   npm run build
   ```

2. **部署到Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用GitHub账号登录
   - 点击 "New site from Git"
   - 选择你的GitHub仓库
   - 设置构建命令：`npm run build`
   - 设置发布目录：`dist`
   - 点击 "Deploy site"

### 方法三：GitHub Pages

1. **安装gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **修改package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://你的用户名.github.io/仓库名"
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

### 方法四：Railway（推荐 - 支持后端）

1. **准备项目**
   ```bash
   npm run build
   ```

2. **部署到Railway**
   - 访问 [railway.app](https://railway.app)
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库
   - 自动部署

### 方法五：Render（免费且简单）

1. **准备项目**
   ```bash
   npm run build
   ```

2. **部署到Render**
   - 访问 [render.com](https://render.com)
   - 注册账号
   - 点击 "New +"
   - 选择 "Static Site"
   - 连接GitHub仓库
   - 设置构建命令：`npm run build`
   - 设置发布目录：`dist`
   - 点击 "Create Static Site"

## 🔧 部署前检查清单

### 1. 构建测试
```bash
# 确保项目可以正常构建
npm run build

# 测试构建结果
npm run preview
```

### 2. 环境变量检查
- 确保所有API密钥都已配置
- 检查生产环境的配置

### 3. 性能优化
```bash
# 分析构建包大小
npm run build -- --analyze
```

### 4. 安全检查
- 检查是否有敏感信息泄露
- 确保API密钥不会暴露在前端代码中

## 🌐 自定义域名设置

### Vercel
1. 在项目设置中找到 "Domains"
2. 添加你的自定义域名
3. 按照提示配置DNS记录

### Netlify
1. 在站点设置中找到 "Domain management"
2. 添加自定义域名
3. 配置DNS记录

## 📱 PWA支持（可选）

如果要添加PWA支持，需要：

1. **安装依赖**
   ```bash
   npm install vite-plugin-pwa
   ```

2. **配置vite.config.ts**
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ]
   })
   ```

3. **添加manifest.json**
   ```json
   {
     "name": "PDF阅读器挂机游戏",
     "short_name": "PDF游戏",
     "description": "一个结合PDF阅读和挂机游戏的Web应用",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#3b82f6",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

## 🔍 部署后检查

1. **功能测试**
   - PDF上传和显示
   - 游戏功能
   - 响应式设计
   - 快捷键功能

2. **性能测试**
   - 页面加载速度
   - PDF渲染性能
   - 游戏运行流畅度

3. **兼容性测试**
   - 不同浏览器
   - 移动设备
   - 不同屏幕尺寸

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   - 检查依赖是否正确安装
   - 查看构建日志中的错误信息
   - 确保所有导入的模块都存在

2. **PDF无法加载**
   - 检查PDF.js worker文件路径
   - 确保public目录中有pdf.worker.min.js文件

3. **游戏功能异常**
   - 检查localStorage权限
   - 确保Zustand状态管理正常工作

4. **样式问题**
   - 检查Tailwind CSS是否正确构建
   - 确保所有CSS类名正确

### 调试技巧

1. **查看控制台错误**
   ```javascript
   // 在浏览器控制台中查看错误
   console.error('错误信息');
   ```

2. **检查网络请求**
   - 使用浏览器开发者工具查看网络请求
   - 检查是否有404或其他错误

3. **性能分析**
   - 使用Lighthouse进行性能分析
   - 检查Core Web Vitals指标

## 📞 技术支持

如果遇到部署问题，可以：

1. 查看平台官方文档
2. 检查GitHub Issues
3. 在社区论坛寻求帮助
4. 联系平台技术支持

---

**推荐部署平台：Vercel**
- 免费额度充足
- 部署简单快速
- 自动HTTPS
- 全球CDN
- 与GitHub完美集成 