from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    """任务基本模式"""
    title: str = Field(..., min_length=1, max_length=100, description="任务标题")
    description: Optional[str] = Field(None, max_length=1000, description="任务描述")
    completed: bool = Field(False, description="是否已完成")

class TaskCreate(TaskBase):
    """创建任务的请求模式"""
    pass

class TaskUpdate(BaseModel):
    """更新任务的请求模式"""
    title: Optional[str] = Field(None, min_length=1, max_length=100, description="任务标题")
    description: Optional[str] = Field(None, max_length=1000, description="任务描述")
    completed: Optional[bool] = Field(None, description="是否已完成")

class TaskResponse(TaskBase):
    """任务响应模式"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True 