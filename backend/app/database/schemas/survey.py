"""
Survey related data models
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from .base import BaseSchema
from .survey_question import SurveyQuestion


class SurveyBase(BaseModel):
    """Base survey model"""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "draft"
    language: Optional[str] = "en"
    user_id: Optional[str] = None


class SurveyCreate(SurveyBase):
    """Model used when creating a survey"""
    pass


class SurveyUpdate(BaseModel):
    """Model used when updating a survey"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    language: Optional[str] = None
    user_id: Optional[str] = None


class Survey(SurveyBase):
    """Complete survey model including database fields"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class SurveyWithQuestions(Survey):
    """Survey model with list of questions"""
    questions: List[SurveyQuestion] = [] 