"""
问卷相关数据模型
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .base import BaseSchema
from .survey_question import SurveyQuestion


class SurveyBase(BaseModel):
    """问卷基础模型"""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "draft"
    language: Optional[str] = "zh-CN"
    user_id: Optional[str] = None


class SurveyCreate(SurveyBase):
    """创建问卷时使用的模型"""
    pass


class SurveyUpdate(BaseModel):
    """更新问卷时使用的模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    language: Optional[str] = None
    user_id: Optional[str] = None


class Survey(SurveyBase):
    """问卷完整模型，包含数据库返回的字段"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class SurveyWithQuestions(Survey):
    """包含问题列表的问卷模型"""
    questions: List[SurveyQuestion] = [] 