"""
问卷问题数据访问对象
"""

from typing import List, Optional
from datetime import datetime

from ..config import get_supabase
from ..schemas import SurveyQuestion, SurveyQuestionCreate, SurveyQuestionUpdate
from .utils import format_timestamp


class SurveyQuestionDAO:
    """问卷问题数据访问对象"""
    
    @staticmethod
    async def create(question: SurveyQuestionCreate) -> SurveyQuestion:
        """
        创建问卷问题
        
        Args:
            question: 问卷问题创建模型
            
        Returns:
            创建后的问卷问题模型
        """
        client = get_supabase()
        data = question.dict()
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        
        response = client.table('cu_survey_questions').insert(data).execute()
        result = response.data[0]
        
        return SurveyQuestion(**format_timestamp(result))
    
    @staticmethod
    async def get_by_id(question_id: int) -> Optional[SurveyQuestion]:
        """
        根据ID获取问卷问题
        
        Args:
            question_id: 问题ID
            
        Returns:
            问卷问题模型，如果不存在则返回None
        """
        client = get_supabase()
        response = client.table('cu_survey_questions').select('*').eq('id', question_id).execute()
        
        if not response.data:
            return None
        
        return SurveyQuestion(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def get_by_survey_id(survey_id: int) -> List[SurveyQuestion]:
        """
        获取问卷的所有问题
        
        Args:
            survey_id: 问卷ID
            
        Returns:
            问卷问题模型列表
        """
        client = get_supabase()
        response = client.table('cu_survey_questions')\
            .select('*').eq('survey_id', survey_id).order('question_order').execute()
        
        return [SurveyQuestion(**format_timestamp(q)) for q in response.data]
    
    @staticmethod
    async def update(question_id: int, question_update: SurveyQuestionUpdate) -> Optional[SurveyQuestion]:
        """
        更新问卷问题
        
        Args:
            question_id: 问题ID
            question_update: 问题更新模型
            
        Returns:
            更新后的问卷问题模型，如果不存在则返回None
        """
        client = get_supabase()
        data = {k: v for k, v in question_update.dict().items() if v is not None}
        data['updated_at'] = datetime.now().isoformat()
        
        response = client.table('cu_survey_questions').update(data).eq('id', question_id).execute()
        
        if not response.data:
            return None
            
        return SurveyQuestion(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def delete(question_id: int) -> bool:
        """
        删除问卷问题
        
        Args:
            question_id: 问题ID
            
        Returns:
            是否删除成功
        """
        client = get_supabase()
        response = client.table('cu_survey_questions').delete().eq('id', question_id).execute()
        return len(response.data) > 0
    
    @staticmethod
    async def reorder_questions(survey_id: int, question_ids: List[int]) -> List[SurveyQuestion]:
        """
        重新排序问卷问题
        
        Args:
            survey_id: 问卷ID
            question_ids: 问题ID列表，按新顺序排列
            
        Returns:
            更新后的问卷问题模型列表
        """
        client = get_supabase()
        updated_questions = []
        
        for idx, question_id in enumerate(question_ids, start=1):
            data = {'question_order': idx, 'updated_at': datetime.now().isoformat()}
            response = client.table('cu_survey_questions')\
                .update(data).eq('id', question_id).eq('survey_id', survey_id).execute()
            
            if response.data:
                updated_questions.append(SurveyQuestion(**format_timestamp(response.data[0])))
        
        return updated_questions 