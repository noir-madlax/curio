# React + Python 全栈应用

这是一个使用React前端和Python后端的全栈应用模板。

## 项目结构

```
project/
│
├── frontend/               # React前端应用
│   ├── public/             # 静态资源
│   ├── src/                # 源代码
│   │   ├── assets/         # 图片、图标等资源
│   │   ├── components/     # React组件
│   │   ├── hooks/          # 自定义React Hooks
│   │   └── pages/          # 页面组件
│   ├── index.html          # HTML入口文件
│   ├── vite.config.js      # Vite配置
│   └── package.json        # 依赖配置
│
├── backend/                # Python后端应用
│   ├── app/                # 主应用目录
│   │   ├── routes/         # API路由
│   │   ├── models.py       # 数据库模型
│   │   ├── schemas.py      # Pydantic模式
│   │   ├── database.py     # 数据库配置
│   │   └── main.py         # FastAPI应用实例
│   ├── main.py             # 应用入口
│   ├── config/             # 配置文件
│   ├── utils/              # 工具函数
│   └── requirements.txt    # Python依赖
│
├── .gitignore              # Git忽略文件
└── README.md               # 项目说明
```

## 技术栈

### 前端
- React
- React Router
- Axios
- Vite

### 后端
- Python
- FastAPI
- SQLAlchemy
- SQLite (可切换至PostgreSQL等)

## 开始使用

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 运行。

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

后端API将在 http://localhost:6000 运行。

## API文档

启动后端服务后，可以访问 http://localhost:6000/docs 查看自动生成的API文档。

## 主要功能

- 前后端分离架构
- React组件化开发
- FastAPI RESTful API
- 数据库ORM
- API文档自动生成
- 前端开发热重载
- 后端代码热重载

## 许可证

MIT 