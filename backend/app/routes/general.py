from fastapi import APIRouter, Depends

router = APIRouter(tags=["general"])

@router.get("/api/hello")
async def hello():
    """测试API端点"""
    return {"message": "后端服务连接成功！"} 