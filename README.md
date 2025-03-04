# Grok API 使用统计

![count](https://github.com/user-attachments/assets/3d59310b-fa23-45df-9401-340137170bd6)


[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

一个基于 Cloudflare Workers 的轻量级应用，用于监控和管理多个 Grok "API" 账号的使用情况，包括标准、思考和深度模式的剩余调用次数。

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
![image](https://github.com/user-attachments/assets/d82b547e-7935-4237-b060-b07d50472aa9)
![image](https://github.com/user-attachments/assets/ba02378c-84fa-4c77-b3ea-6947a796f818)


## SSO Token 详情
![image](https://github.com/user-attachments/assets/50e60e2f-475e-491d-b779-1f0ee22a591d)


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

## KV 消耗量估算
### 读取操作
**SSO 列表读取：**
- 内存缓存按10分钟缓存，每10分钟最多读取一次 KV
- 每小时最多 6 次读取，每天约 144 次读取

**统计数据读取：**
- 每个 SSO 有 3 种模式 (DEFAULT, REASONING, DEEPSEARCH)
- 假设有 10 个 SSO，每次刷新需要 3 × 10 = 30 次读取
- 内存缓存减少到每10分钟最多读取一次
- 每小时最多 6 次读取，每天约 144 × 30 = 4,320 次读取

**总计**
- 读取操作：约 144 + 4,320 = 4,464 次/天（低于 5,000 次目标）
- 写入操作：约 20 + 360 = 380 次/天（低于 500 次目标）

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 来改进这个项目！ 

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 提供强大的边缘计算平台
- [Tailwind CSS](https://tailwindcss.com/) - 提供实用的 CSS 框架
- [Chart.js](https://www.chartjs.org/) - 提供简单灵活的图表库
- [Font Awesome](https://fontawesome.com/) - 提供丰富的图标库

---

如有问题或建议，请 [创建 Issue](https://github.com/yourusername/grok-remain-count/issues/new)
