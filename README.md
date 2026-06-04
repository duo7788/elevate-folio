# Elevate Folio

余子涵的个人作品集网站，用于展示个人介绍、简历和近期完成的 AI / vibe coding 项目。

## 内容

- 个人介绍、邮箱、电话和简历入口
- 项目瀑布流展示
- 项目详情、项目链接和故事页
- 管理入口，可在浏览器中编辑个人信息、项目文案、头像、简历和项目图片
- 图片与简历导出到 `public/` 后可直接部署

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

## 本地运行

```bash
npm install
npm run dev
```

默认开发服务会从 `http://localhost:3000/` 开始尝试，如果端口被占用，Vite 会自动选择下一个可用端口。

## 部署

部署到 Vercel 或其他静态站点平台时，使用以下命令：

```bash
npm run build
```

构建产物会生成在 `dist/`。

## 环境变量

```bash
VITE_ADMIN_PASSWORD=your-password
```

`VITE_ADMIN_PASSWORD` 用于前端编辑入口的简单访问保护。它会被打包到浏览器代码中，只适合防止随手误点，不等同于后端权限系统。

## 项目文件

- `content.json`：作品集默认内容
- `public/resume.pdf`：线上简历文件
- `public/images/`：项目图片和头像
- `src/components/`：页面组件
- `src/*Storage.ts`：浏览器本地编辑内容的存储逻辑
