

下面是一个完整详细的 README.md 文件：


# Grok API 使用统计

![Grok API 使用统计](https://your-screenshot-url-here.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

一个基于 Cloudflare Workers 的轻量级应用，用于监控和管理多个 Grok API 账号的使用情况，包括标准、思考和深度模式的剩余调用次数。

## 功能特点

- 📊 **实时监控**：追踪多个 SSO Token 的 Grok API 使用情况
- 🔄 **多模式支持**：显示标准、思考和深度三种模式的剩余调用次数
- 📱 **响应式设计**：在任何设备上都能完美展示
- 🔒 **管理员面板**：安全的 Token 管理界面
- 📈 **数据可视化**：直观的图表展示使用情况
- ⚡ **高性能**：基于 Cloudflare Workers 的边缘计算
- 🔄 **自动刷新**：定期自动更新数据

## 截图

### 主页面
![主页面](https://your-main-page-screenshot-url-here.png)

### 管理面板
![管理面板](https://your-admin-panel-screenshot-url-here.png)

## 部署指南

### 前提条件

- Cloudflare 账号

### 部署步骤

1. **创建 Worker**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages" 页面
   - 点击 "Create application"
   - 选择 "Create Worker"
   - 为您的 Worker 命名并创建

2. **创建 KV 命名空间**
   - 在 Workers & Pages 页面左侧菜单中选择 "KV"
   - 点击 "Create a namespace"
   - 命名为 "GROK_KV"
   - 在您的 Worker 的 "Settings" > "Variables" 中绑定该 KV 命名空间

3. **配置环境变量**
   - 在 Worker 的 "Settings" > "Variables" 中添加以下环境变量：
     - `ADMIN_USERNAME`: 管理员用户名
     - `ADMIN_PASSWORD`: 管理员密码
   - 点击 "Save and deploy"

4. **部署代码**
   - 在 Worker 的 "Quick edit" 中粘贴项目代码
   - 点击 "Save and deploy"

完成以上步骤后，您可以通过分配的 *.workers.dev 域名访问您的应用。


## 使用指南

### 主页面

1. 查看所有 SSO Token 的剩余调用次数
2. 使用顶部的刷新按钮手动更新数据
3. 通过快速添加表单添加新的 SSO Token

### 管理面板

1. 访问 `/admin` 路径并使用管理员凭据登录
2. 添加、删除或复制 SSO Token
3. 查看完整的 Token 信息

## 技术栈

- **Cloudflare Workers**: 提供无服务器运行环境
- **Cloudflare KV**: 用于数据存储
- **Tailwind CSS**: 用于界面样式
- **Chart.js**: 用于数据可视化
- **Font Awesome**: 提供图标支持

## 自定义配置

### 修改缓存时间

默认情况下，API 数据缓存 60 秒。您可以通过修改 `getCachedStats` 函数中的时间来调整：

```javascript
if (Date.now() - cachedData.timestamp < 60000) { // 60 秒
    return cachedData.value;
}
```

### 修改刷新间隔

前端自动刷新间隔默认为 20 秒，可以通过修改以下变量调整：

```javascript
const REFRESH_INTERVAL = 20000; // 20 秒
```

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 来改进这个项目！

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 提供强大的边缘计算平台
- [Tailwind CSS](https://tailwindcss.com/) - 提供实用的 CSS 框架
- [Chart.js](https://www.chartjs.org/) - 提供简单灵活的图表库
- [Font Awesome](https://fontawesome.com/) - 提供丰富的图标库

---

如有问题或建议，请 [创建 Issue](https://github.com/yourusername/grok-remain-count/issues/new)
