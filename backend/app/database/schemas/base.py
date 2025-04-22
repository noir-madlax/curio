"""
基础模型定义
为所有数据模型提供基类
"""

from pydantic import BaseModel


class BaseSchema(BaseModel):
    """
    所有数据模型的基类
    提供通用配置和方法
    """
    class Config:
        from_attributes = True  # 兼容ORM模型 