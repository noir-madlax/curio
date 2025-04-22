from typing import Dict, Any
from fastapi import APIRouter

from ..database import test_supabase_connection, get_database_tables_info
from ..database.schemas import HealthResponse, DatabaseHealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    健康检查端点
    """
    return HealthResponse(
        status="ok",
        service="survey-api",
        version="1.0.0"
    )


@router.get("/db", response_model=DatabaseHealthResponse)
async def database_health() -> DatabaseHealthResponse:
    """
    数据库健康检查端点 - 检查Supabase连接
    """
    supabase_connected = await test_supabase_connection()
    
    response = DatabaseHealthResponse(
        supabase_connected=supabase_connected
    )
    
    if supabase_connected:
        tables_info = await get_database_tables_info()
        response.tables = list(tables_info.keys())
        
    return response 