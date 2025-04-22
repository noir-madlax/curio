from fastapi import APIRouter

from .health import router as health_router
from .tables import router as tables_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(tables_router, prefix="/tables", tags=["tables"]) 