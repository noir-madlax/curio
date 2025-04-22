"""
问卷问题相关数据模型
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from .base import BaseSchema


class SurveyQuestionBase(BaseModel):
    """问卷问题基础模型"""
    survey_id: int
    question_text: str
    question_order: int
    question_type: Optional[str] = "text"
    followup_count: Optional[int] = 0
    question_objectives: Optional[str] = None


class SurveyQuestionCreate(SurveyQuestionBase):
    """创建问卷问题时使用的模型"""
    pass


class SurveyQuestionUpdate(BaseModel):
    """更新问卷问题时使用的模型"""
    question_text: Optional[str] = None
    question_order: Optional[int] = None
    question_type: Optional[str] = None
    followup_count: Optional[int] = None
    question_objectives: Optional[str] = None


class SurveyQuestion(SurveyQuestionBase):
    """问卷问题完整模型，包含数据库返回的字段"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 