"""
问卷回答对话相关数据模型
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from .base import BaseSchema


class SurveyResponseConversationBase(BaseModel):
    """问卷回答对话基础模型"""
    survey_response_id: int
    speaker_type: str  # 'system', 'user', 等
    message_text: str
    conversation_order: int


class SurveyResponseConversationCreate(SurveyResponseConversationBase):
    """创建问卷回答对话时使用的模型"""
    pass


class SurveyResponseConversationUpdate(BaseModel):
    """更新问卷回答对话时使用的模型"""
    message_text: Optional[str] = None
    speaker_type: Optional[str] = None
    conversation_order: Optional[int] = None


class SurveyResponseConversation(SurveyResponseConversationBase):
    """问卷回答对话完整模型，包含数据库返回的字段"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 