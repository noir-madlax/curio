"""
通用数据模型
包含表查询和健康检查等通用模型
"""

from typing import List, Dict, Any, Optional
from .base import BaseSchema


# 表查询响应模型
class TableQueryParams(BaseSchema):
    """表查询参数模型"""
    select_fields: Optional[str] = "*"
    limit: Optional[int] = 100
    offset: Optional[int] = 0
    

class TableQueryResponse(BaseSchema):
    """表查询响应模型"""
    data: List[Dict[str, Any]]
    count: int


# 关系数据响应模型
class RelatedDataResponse(BaseSchema):
    """关系数据响应模型"""
    main_record: Dict[str, Any]
    related_records: Dict[str, List[Dict[str, Any]]]


# 健康检查响应模型
class HealthResponse(BaseSchema):
    """健康检查响应模型"""
    status: str
    service: str
    version: str


class DatabaseHealthResponse(BaseSchema):
    """数据库健康检查响应模型"""
    supabase_connected: bool
    tables: Optional[List[str]] = None 