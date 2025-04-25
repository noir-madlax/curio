# Docker 部署说明

本项目使用Docker Compose进行容器化部署，前端保持原样独立运行，后端在Docker容器中运行。

## 项目结构

```
project/
│
├── frontend/               # React前端应用（本地运行）
│
├── backend/                # Python后端应用（Docker容器运行）
│   ├── Dockerfile          # 后端Docker配置
│   ├── docker-compose.yml  # Docker Compose配置
│   ├── .dockerignore       # Docker忽略文件
│   └── ...
│
└── DOCKER_README.md        # Docker说明文档
```

## 启动步骤

### 1. 启动后端（Docker）

在backend目录下运行以下命令启动后端服务：

```bash
cd backend
docker-compose up -d
```

这将构建并启动后端容器，服务将在 http://localhost:8080 上运行。

要查看后端日志：

```bash
cd backend
docker-compose logs -f backend
```

要停止后端服务：

```bash
cd backend
docker-compose down
```

### 2. 启动前端（本地）

前端仍然在本地开发环境中运行：

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 上运行，并自动连接到Docker中的后端服务。

## API文档

启动后端服务后，可以访问 http://localhost:8080/docs 查看自动生成的API文档。

## 其他Docker命令

重新构建后端镜像：

```bash
cd backend
docker-compose build
```

查看容器状态：

```bash
cd backend
docker-compose ps
```
