from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import tasks, general
from .database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="React+Python 应用 API",
    description="基于FastAPI的后端API",
    version="0.1.0"
)

# 配置跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(general.router)
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"]) 