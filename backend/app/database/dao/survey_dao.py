"""
问卷数据访问对象
"""

from typing import List, Optional
from datetime import datetime

from ..config import get_supabase
from ..schemas import Survey, SurveyCreate, SurveyUpdate, SurveyWithQuestions, SurveyQuestion
from .utils import format_timestamp


class SurveyDAO:
    """问卷数据访问对象"""
    
    @staticmethod
    async def create(survey: SurveyCreate) -> Survey:
        """
        创建新问卷
        
        Args:
            survey: 问卷创建模型
            
        Returns:
            创建后的问卷模型
        """
        client = get_supabase()
        data = survey.dict()
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        
        response = client.table('cu_survey').insert(data).execute()
        result = response.data[0]
        
        return Survey(**format_timestamp(result))
    
    @staticmethod
    async def get_by_id(survey_id: int) -> Optional[Survey]:
        """
        根据ID获取问卷
        
        Args:
            survey_id: 问卷ID
            
        Returns:
            问卷模型，如果不存在则返回None
        """
        client = get_supabase()
        response = client.table('cu_survey').select('*').eq('id', survey_id).execute()
        
        if not response.data:
            return None
        
        return Survey(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def get_all(
        limit: int = 100,
        offset: int = 0,
        status: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[Survey]:
        """
        获取所有问卷，可按状态和用户ID筛选
        
        Args:
            limit: 返回记录数量限制
            offset: 分页偏移量
            status: 问卷状态过滤
            user_id: 用户ID过滤
            
        Returns:
            问卷模型列表
        """
        client = get_supabase()
        query = client.table('cu_survey').select('*').order('created_at', desc=True).limit(limit).offset(offset)
        
        if status:
            query = query.eq('status', status)
        if user_id:
            query = query.eq('user_id', user_id)
            
        response = query.execute()
        return [Survey(**format_timestamp(item)) for item in response.data]
    
    @staticmethod
    async def update(survey_id: int, survey_update: SurveyUpdate) -> Optional[Survey]:
        """
        更新问卷
        
        Args:
            survey_id: 问卷ID
            survey_update: 问卷更新模型
            
        Returns:
            更新后的问卷模型，如果不存在则返回None
        """
        client = get_supabase()
        data = {k: v for k, v in survey_update.dict().items() if v is not None}
        data['updated_at'] = datetime.now().isoformat()
        
        response = client.table('cu_survey').update(data).eq('id', survey_id).execute()
        
        if not response.data:
            return None
            
        return Survey(**format_timestamp(response.data[0]))
    
    @staticmethod
    async def delete(survey_id: int) -> bool:
        """
        删除问卷
        
        Args:
            survey_id: 问卷ID
            
        Returns:
            是否删除成功
        """
        client = get_supabase()
        response = client.table('cu_survey').delete().eq('id', survey_id).execute()
        return len(response.data) > 0
    
    @staticmethod
    async def get_with_questions(survey_id: int) -> Optional[SurveyWithQuestions]:
        """
        获取问卷及其所有问题
        
        Args:
            survey_id: 问卷ID
            
        Returns:
            包含问题列表的问卷模型，如果不存在则返回None
        """
        client = get_supabase()
        
        # 获取问卷
        survey_response = client.table('cu_survey').select('*').eq('id', survey_id).execute()
        if not survey_response.data:
            return None
        
        survey_data = format_timestamp(survey_response.data[0])
        
        # 获取问卷问题
        questions_response = client.table('cu_survey_questions')\
            .select('*').eq('survey_id', survey_id).order('question_order').execute()
        
        questions = [SurveyQuestion(**format_timestamp(q)) for q in questions_response.data]
        
        # 创建包含问题的问卷
        return SurveyWithQuestions(**survey_data, questions=questions) 