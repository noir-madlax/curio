from sqlalchemy import Column, Integer, String, Text, BigInteger, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .config import Base

class Survey(Base):
    __tablename__ = "cu_survey"
    
    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String)
    user_id = Column(String)  # 使用String类型存储UUID
    language = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    questions = relationship("SurveyQuestion", back_populates="survey", cascade="all, delete-orphan")
    responses = relationship("SurveyResponse", back_populates="survey", cascade="all, delete-orphan")


class SurveyQuestion(Base):
    __tablename__ = "cu_survey_questions"
    
    id = Column(BigInteger, primary_key=True, index=True)
    survey_id = Column(BigInteger, ForeignKey("cu_survey.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    question_order = Column(Integer)
    followup_count = Column(Integer)
    question_type = Column(String)
    question_objectives = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    survey = relationship("Survey", back_populates="questions")


class SurveyResponse(Base):
    __tablename__ = "cu_survey_responses"
    
    id = Column(BigInteger, primary_key=True, index=True)
    survey_id = Column(BigInteger, ForeignKey("cu_survey.id", ondelete="CASCADE"))
    respondent_identifier = Column(String)
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    survey = relationship("Survey", back_populates="responses")
    conversations = relationship("SurveyResponseConversation", back_populates="response", cascade="all, delete-orphan")


class SurveyResponseConversation(Base):
    __tablename__ = "cu_survey_response_conversations"
    
    id = Column(BigInteger, primary_key=True, index=True)
    survey_response_id = Column(BigInteger, ForeignKey("cu_survey_responses.id", ondelete="CASCADE"))
    speaker_type = Column(String)
    message_text = Column(Text)
    conversation_order = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    response = relationship("SurveyResponse", back_populates="conversations")