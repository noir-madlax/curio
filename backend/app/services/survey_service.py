"""
问卷服务层
负责处理业务逻辑，调用DAO层进行数据操作
"""

from typing import List, Dict, Any, Optional, Union
from ..database.dao import (
    SurveyDAO, 
    SurveyQuestionDAO, 
    SurveyResponseDAO, 
    SurveyResponseConversationDAO
)
from ..database.schemas import (
    Survey, SurveyCreate, SurveyUpdate,
    SurveyQuestion, SurveyQuestionCreate, SurveyQuestionUpdate,
    SurveyResponse, SurveyResponseCreate, SurveyResponseUpdate,
    SurveyResponseConversation, SurveyResponseConversationCreate,
    SurveyWithQuestions, SurveyResponseWithConversations
)


class SurveyService:
    """问卷服务类"""
    
    @staticmethod
    async def create_survey(survey_data: Dict[str, Any]) -> Survey:
        """创建新问卷"""
        survey = SurveyCreate(**survey_data)
        return await SurveyDAO.create(survey)
    
    @staticmethod
    async def get_survey(survey_id: int) -> Optional[Survey]:
        """获取问卷信息"""
        return await SurveyDAO.get_by_id(survey_id)
    
    @staticmethod
    async def get_all_surveys(
        limit: int = 100,
        offset: int = 0,
        status: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[Survey]:
        """获取所有问卷列表"""
        return await SurveyDAO.get_all(limit, offset, status, user_id)
    
    @staticmethod
    async def update_survey(survey_id: int, survey_data: Dict[str, Any]) -> Optional[Survey]:
        """更新问卷信息"""
        survey_update = SurveyUpdate(**survey_data)
        return await SurveyDAO.update(survey_id, survey_update)
    
    @staticmethod
    async def delete_survey(survey_id: int) -> bool:
        """删除问卷"""
        return await SurveyDAO.delete(survey_id)
    
    @staticmethod
    async def get_survey_with_questions(survey_id: int) -> Optional[SurveyWithQuestions]:
        """获取问卷及其所有问题"""
        return await SurveyDAO.get_with_questions(survey_id)
    
    @staticmethod
    async def add_question_to_survey(survey_id: int, question_data: Dict[str, Any]) -> SurveyQuestion:
        """向问卷添加问题"""
        # 获取问卷当前问题数
        existing_questions = await SurveyQuestionDAO.get_by_survey_id(survey_id)
        next_order = len(existing_questions) + 1
        
        # 创建问题
        question_data['survey_id'] = survey_id
        if 'question_order' not in question_data:
            question_data['question_order'] = next_order
        
        question = SurveyQuestionCreate(**question_data)
        return await SurveyQuestionDAO.create(question)
    
    @staticmethod
    async def reorder_survey_questions(survey_id: int, question_ids: List[int]) -> List[SurveyQuestion]:
        """重新排序问卷问题"""
        return await SurveyQuestionDAO.reorder_questions(survey_id, question_ids)
    
    @staticmethod
    async def update_question(question_id: int, question_data: Dict[str, Any]) -> Optional[SurveyQuestion]:
        """更新问题信息"""
        question_update = SurveyQuestionUpdate(**question_data)
        return await SurveyQuestionDAO.update(question_id, question_update)
    
    @staticmethod
    async def delete_question(question_id: int) -> bool:
        """删除问题"""
        return await SurveyQuestionDAO.delete(question_id)


class SurveyResponseService:
    """问卷回答服务类"""
    
    @staticmethod
    async def create_response(response_data: Dict[str, Any]) -> SurveyResponse:
        """创建问卷回答"""
        response = SurveyResponseCreate(**response_data)
        return await SurveyResponseDAO.create(response)
    
    @staticmethod
    async def get_response(response_id: int) -> Optional[SurveyResponse]:
        """获取问卷回答信息"""
        return await SurveyResponseDAO.get_by_id(response_id)
    
    @staticmethod
    async def get_responses_by_survey(
        survey_id: int,
        limit: int = 100,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[SurveyResponse]:
        """获取问卷的所有回答"""
        return await SurveyResponseDAO.get_by_survey_id(survey_id, limit, offset, status)
    
    @staticmethod
    async def update_response(response_id: int, response_data: Dict[str, Any]) -> Optional[SurveyResponse]:
        """更新问卷回答信息"""
        response_update = SurveyResponseUpdate(**response_data)
        return await SurveyResponseDAO.update(response_id, response_update)
    
    @staticmethod
    async def delete_response(response_id: int) -> bool:
        """删除问卷回答"""
        return await SurveyResponseDAO.delete(response_id)
    
    @staticmethod
    async def get_response_with_conversations(response_id: int) -> Optional[SurveyResponseWithConversations]:
        """获取问卷回答及其所有对话"""
        return await SurveyResponseDAO.get_with_conversations(response_id)
    
    @staticmethod
    async def add_conversation(conversation_data: Dict[str, Any]) -> SurveyResponseConversation:
        """添加对话消息"""
        conversation = SurveyResponseConversationCreate(**conversation_data)
        return await SurveyResponseConversationDAO.create(conversation)
    
    @staticmethod
    async def add_batch_conversations(
        response_id: int,
        conversations: List[Dict[str, Any]]
    ) -> List[SurveyResponseConversation]:
        """批量添加对话消息"""
        return await SurveyResponseConversationDAO.add_batch_conversations(response_id, conversations)
    
    @staticmethod
    async def update_conversation(
        conversation_id: int,
        conversation_data: Dict[str, Any]
    ) -> Optional[SurveyResponseConversation]:
        """更新对话消息"""
        conversation_update = SurveyResponseConversationUpdate(**conversation_data)
        return await SurveyResponseConversationDAO.update(conversation_id, conversation_update)
    
    @staticmethod
    async def delete_conversation(conversation_id: int) -> bool:
        """删除对话消息"""
        return await SurveyResponseConversationDAO.delete(conversation_id) 