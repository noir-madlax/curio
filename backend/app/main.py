import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,  # 修改为DEBUG级别以显示更详细的日志
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # 输出到控制台
    ]
)

# 为了减少第三方库的噪音，单独设置一些库的日志级别
logging.getLogger('boto3').setLevel(logging.INFO)
logging.getLogger('botocore').setLevel(logging.INFO)
logging.getLogger('urllib3').setLevel(logging.INFO)

logger = logging.getLogger(__name__)

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

# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("应用启动")
    # 打印环境变量信息
    logger.info(f"LLM提供商: {os.environ.get('LLM_PROVIDER', 'bedrock')}")
    logger.info(f"模型ID: {os.environ.get('LLM_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')}")
    logger.info(f"AWS区域: {os.environ.get('AWS_REGION', 'us-west-2')}")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("应用关闭")

# 根路由
@app.get("/")
async def root():
    logger.info("访问根路由")
    return {
        "message": "Welcome to Curio Survey API",
        "docs": "/docs",
        "version": "1.0.0"
    } 