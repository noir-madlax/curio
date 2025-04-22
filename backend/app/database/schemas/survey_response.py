"""
问卷回答相关数据模型
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .base import BaseSchema
from .survey_response_conversation import SurveyResponseConversation


class SurveyResponseBase(BaseModel):
    """问卷回答基础模型"""
    survey_id: int
    respondent_identifier: Optional[str] = None
    status: Optional[str] = "pending"


class SurveyResponseCreate(SurveyResponseBase):
    """创建问卷回答时使用的模型"""
    pass


class SurveyResponseUpdate(BaseModel):
    """更新问卷回答时使用的模型"""
    status: Optional[str] = None
    respondent_identifier: Optional[str] = None


class SurveyResponse(SurveyResponseBase):
    """问卷回答完整模型，包含数据库返回的字段"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class SurveyResponseWithConversations(SurveyResponse):
    """包含对话列表的问卷回答模型"""
    conversations: List[SurveyResponseConversation] = [] 