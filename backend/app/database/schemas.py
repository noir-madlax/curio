from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# 基础模型类
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True  # 兼容ORM模型


# Survey模型
class Survey(BaseSchema):
    id: int
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    language: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# SurveyQuestion模型
class SurveyQuestion(BaseSchema):
    id: int
    survey_id: int
    question_text: str
    question_order: Optional[int] = None
    followup_count: Optional[int] = None
    question_type: Optional[str] = None
    question_objectives: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# SurveyResponse模型
class SurveyResponse(BaseSchema):
    id: int
    survey_id: int
    respondent_identifier: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# SurveyResponseConversation模型
class SurveyResponseConversation(BaseSchema):
    id: int
    survey_response_id: int
    speaker_type: str
    message_text: str
    conversation_order: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# 表查询响应模型
class TableQueryParams(BaseSchema):
    select_fields: Optional[str] = "*"
    limit: Optional[int] = 100
    offset: Optional[int] = 0
    

class TableQueryResponse(BaseSchema):
    data: List[Dict[str, Any]]
    count: int


# 关系数据响应模型
class RelatedDataResponse(BaseSchema):
    main_record: Dict[str, Any]
    related_records: Dict[str, List[Dict[str, Any]]]


# 健康检查响应模型
class HealthResponse(BaseSchema):
    status: str
    service: str
    version: str


class DatabaseHealthResponse(BaseSchema):
    supabase_connected: bool
    tables: Optional[List[str]] = None