"""
问卷回答对话数据访问对象
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

from ..config import get_supabase
from ..schemas import (
    SurveyResponseConversation, SurveyResponseConversationCreate,
    SurveyResponseConversationUpdate
)
from .utils import format_timestamp


class SurveyResponseConversationDAO:
    """问卷回答对话数据访问对象"""
    
    @staticmethod
    async def create(conversation: SurveyResponseConversationCreate) -> SurveyResponseConversation:
        """
        创建问卷回答对话
        
        Args:
            conversation: 问卷回答对话创建模型
            
        Returns:
            创建后的问卷回答对话模型
        """
        client = get_supabase()
        data = conversation.dict()
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        
        response = client.table('cu_survey_response_conversations').insert(data).execute()
        result = response.data[0]
        
        return SurveyResponseConversation(**format_timestamp(result))
    
    @staticmethod
    async def get_by_id(conversation_id: int) -> Optional[SurveyResponseConversation]:
        """
        根据ID获取问卷回答对话
        
        Args:
            conversation_id: 对话ID
            
        Returns:
            问卷回答对话模型，如果不存在则返回None
        """
        client = get_supabase()
        response = client.table('cu_survey_response_conversations').select('*').eq('id', conversation_id).execute()
        
        if not response.data:
            return None
        
        return SurveyResponseConversation(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def get_by_response_id(response_id: int) -> List[SurveyResponseConversation]:
        """
        获取问卷回答的所有对话
        
        Args:
            response_id: 回答ID
            
        Returns:
            问卷回答对话模型列表
        """
        client = get_supabase()
        response = client.table('cu_survey_response_conversations')\
            .select('*').eq('survey_response_id', response_id).order('conversation_order').execute()
        
        return [SurveyResponseConversation(**format_timestamp(c)) for c in response.data]
    
    @staticmethod
    async def update(
        conversation_id: int,
        conversation_update: SurveyResponseConversationUpdate
    ) -> Optional[SurveyResponseConversation]:
        """
        更新问卷回答对话
        
        Args:
            conversation_id: 对话ID
            conversation_update: 对话更新模型
            
        Returns:
            更新后的问卷回答对话模型，如果不存在则返回None
        """
        client = get_supabase()
        data = {k: v for k, v in conversation_update.dict().items() if v is not None}
        data['updated_at'] = datetime.now().isoformat()
        
        response = client.table('cu_survey_response_conversations').update(data).eq('id', conversation_id).execute()
        
        if not response.data:
            return None
            
        return SurveyResponseConversation(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def delete(conversation_id: int) -> bool:
        """
        删除问卷回答对话
        
        Args:
            conversation_id: 对话ID
            
        Returns:
            是否删除成功
        """
        client = get_supabase()
        response = client.table('cu_survey_response_conversations').delete().eq('id', conversation_id).execute()
        return len(response.data) > 0
    
    @staticmethod
    async def add_batch_conversations(
        response_id: int,
        conversations: List[Dict[str, Any]]
    ) -> List[SurveyResponseConversation]:
        """
        批量添加对话
        
        Args:
            response_id: 回答ID
            conversations: 对话数据列表
            
        Returns:
            创建后的问卷回答对话模型列表
        """
        client = get_supabase()
        now = datetime.now().isoformat()
        
        data_to_insert = []
        for i, conv in enumerate(conversations):
            data_to_insert.append({
                'survey_response_id': response_id,
                'speaker_type': conv['speaker_type'],
                'message_text': conv['message_text'],
                'conversation_order': conv.get('conversation_order', i + 1),
                'created_at': now,
                'updated_at': now
            })
        
        response = client.table('cu_survey_response_conversations').insert(data_to_insert).execute()
        
        return [SurveyResponseConversation(**format_timestamp(c)) for c in response.data] 