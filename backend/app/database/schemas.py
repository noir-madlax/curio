from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# 基础模式类
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True  # 允许从ORM模型创建Pydantic模型


# --------- Survey 模式 ---------
class SurveyBase(BaseSchema):
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    language: Optional[str] = None
    
    
class SurveyCreate(SurveyBase):
    pass


class SurveyUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    language: Optional[str] = None


class SurveyInDB(SurveyBase):
    id: int
    created_at: datetime
    updated_at: datetime


class Survey(SurveyInDB):
    pass


# --------- SurveyQuestion 模式 ---------
class SurveyQuestionBase(BaseSchema):
    survey_id: int
    question_text: str
    question_order: Optional[int] = None
    followup_count: Optional[int] = None
    question_type: Optional[str] = None
    question_objectives: Optional[str] = None


class SurveyQuestionCreate(SurveyQuestionBase):
    pass


class SurveyQuestionUpdate(BaseSchema):
    question_text: Optional[str] = None
    question_order: Optional[int] = None
    followup_count: Optional[int] = None
    question_type: Optional[str] = None
    question_objectives: Optional[str] = None


class SurveyQuestionInDB(SurveyQuestionBase):
    id: int
    created_at: datetime
    updated_at: datetime


class SurveyQuestion(SurveyQuestionInDB):
    pass


# --------- SurveyResponse 模式 ---------
class SurveyResponseBase(BaseSchema):
    survey_id: int
    respondent_identifier: Optional[str] = None
    status: Optional[str] = None


class SurveyResponseCreate(SurveyResponseBase):
    pass


class SurveyResponseUpdate(BaseSchema):
    respondent_identifier: Optional[str] = None
    status: Optional[str] = None


class SurveyResponseInDB(SurveyResponseBase):
    id: int
    created_at: datetime
    updated_at: datetime


class SurveyResponse(SurveyResponseInDB):
    pass


# --------- SurveyResponseConversation 模式 ---------
class SurveyResponseConversationBase(BaseSchema):
    survey_response_id: int
    speaker_type: str
    message_text: str
    conversation_order: Optional[int] = None


class SurveyResponseConversationCreate(SurveyResponseConversationBase):
    pass


class SurveyResponseConversationUpdate(BaseSchema):
    speaker_type: Optional[str] = None
    message_text: Optional[str] = None
    conversation_order: Optional[int] = None


class SurveyResponseConversationInDB(SurveyResponseConversationBase):
    id: int
    created_at: datetime
    updated_at: datetime


class SurveyResponseConversation(SurveyResponseConversationInDB):
    pass


# --------- 嵌套关系模式 ---------
class SurveyWithDetails(Survey):
    questions: List[SurveyQuestion] = []
    responses: List[SurveyResponse] = []


class SurveyResponseWithConversations(SurveyResponse):
    conversations: List[SurveyResponseConversation] = []