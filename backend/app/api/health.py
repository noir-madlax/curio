from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.utils import test_database_connection, get_database_tables_info

router = APIRouter()


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """
    健康检查端点
    """
    return {
        "status": "ok",
        "service": "survey-api",
        "version": "1.0.0"
    }


@router.get("/db")
async def database_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    数据库健康检查端点
    """
    db_connected = await test_database_connection()
    
    response = {
        "database_connected": db_connected,
    }
    
    if db_connected:
        tables_info = await get_database_tables_info()
        response["tables"] = list(tables_info.keys())
        
    return response 