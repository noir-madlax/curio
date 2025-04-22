import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router

# 创建FastAPI应用
app = FastAPI(
    title="Curio Survey API",
    description="Curio调查系统后端API",
    version="1.0.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(api_router, prefix="/api/v1")

# 根路由
@app.get("/")
async def root():
    return {
        "message": "Welcome to Curio Survey API",
        "docs": "/docs",
        "version": "1.0.0"
    } 