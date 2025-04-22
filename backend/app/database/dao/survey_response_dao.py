"""
问卷回答数据访问对象
"""

from typing import List, Optional
from datetime import datetime

from ..config import get_supabase
from ..schemas import (
    SurveyResponse, SurveyResponseCreate, SurveyResponseUpdate,
    SurveyResponseWithConversations, SurveyResponseConversation
)
from .utils import format_timestamp


class SurveyResponseDAO:
    """问卷回答数据访问对象"""
    
    @staticmethod
    async def create(response: SurveyResponseCreate) -> SurveyResponse:
        """
        创建问卷回答
        
        Args:
            response: 问卷回答创建模型
            
        Returns:
            创建后的问卷回答模型
        """
        client = get_supabase()
        data = response.dict()
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        
        supabase_response = client.table('cu_survey_responses').insert(data).execute()
        result = supabase_response.data[0]
        
        return SurveyResponse(**format_timestamp(result))
    
    @staticmethod
    async def get_by_id(response_id: int) -> Optional[SurveyResponse]:
        """
        根据ID获取问卷回答
        
        Args:
            response_id: 回答ID
            
        Returns:
            问卷回答模型，如果不存在则返回None
        """
        client = get_supabase()
        response = client.table('cu_survey_responses').select('*').eq('id', response_id).execute()
        
        if not response.data:
            return None
        
        return SurveyResponse(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def get_by_survey_id(
        survey_id: int,
        limit: int = 100,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[SurveyResponse]:
        """
        获取问卷的所有回答
        
        Args:
            survey_id: 问卷ID
            limit: 返回记录数量限制
            offset: 分页偏移量
            status: 回答状态过滤
            
        Returns:
            问卷回答模型列表
        """
        client = get_supabase()
        query = client.table('cu_survey_responses')\
            .select('*').eq('survey_id', survey_id).order('created_at', desc=True).limit(limit).offset(offset)
        
        if status:
            query = query.eq('status', status)
            
        response = query.execute()
        return [SurveyResponse(**format_timestamp(r)) for r in response.data]
    
    @staticmethod
    async def update(response_id: int, response_update: SurveyResponseUpdate) -> Optional[SurveyResponse]:
        """
        更新问卷回答
        
        Args:
            response_id: 回答ID
            response_update: 回答更新模型
            
        Returns:
            更新后的问卷回答模型，如果不存在则返回None
        """
        client = get_supabase()
        data = {k: v for k, v in response_update.dict().items() if v is not None}
        data['updated_at'] = datetime.now().isoformat()
        
        response = client.table('cu_survey_responses').update(data).eq('id', response_id).execute()
        
        if not response.data:
            return None
            
        return SurveyResponse(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def delete(response_id: int) -> bool:
        """
        删除问卷回答
        
        Args:
            response_id: 回答ID
            
        Returns:
            是否删除成功
        """
        client = get_supabase()
        response = client.table('cu_survey_responses').delete().eq('id', response_id).execute()
        return len(response.data) > 0
    
    @staticmethod
    async def get_with_conversations(response_id: int) -> Optional[SurveyResponseWithConversations]:
        """
        获取问卷回答及其所有对话
        
        Args:
            response_id: 回答ID
            
        Returns:
            包含对话列表的问卷回答模型，如果不存在则返回None
        """
        client = get_supabase()
        
        # 获取问卷回答
        response_data = client.table('cu_survey_responses').select('*').eq('id', response_id).execute()
        if not response_data.data:
            return None
        
        survey_response = format_timestamp(response_data.data[0])
        
        # 获取对话记录
        conversations_response = client.table('cu_survey_response_conversations')\
            .select('*').eq('survey_response_id', response_id).order('conversation_order').execute()
        
        conversations = [SurveyResponseConversation(**format_timestamp(c)) for c in conversations_response.data]
        
        # 创建包含对话的问卷回答
        return SurveyResponseWithConversations(**survey_response, conversations=conversations) 