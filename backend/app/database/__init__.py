"""
数据库模块
提供统一的数据库访问接口
"""

# 配置
from .config import get_supabase

# DAO类
from .dao import (
    SurveyDAO,
    SurveyQuestionDAO,
    SurveyResponseDAO,
    SurveyResponseConversationDAO
)

# 工具函数
from .dao.utils import format_timestamp
from .utils import (
    test_supabase_connection, 
    get_database_tables_info,
    query_table,
    get_by_id,
    get_related_data
)

# 模型
from .schemas import (
    # 基础模型
    BaseSchema,
    
    # 问卷相关模型
    Survey, SurveyBase, SurveyCreate, SurveyUpdate,
    SurveyWithQuestions,
    
    # 问卷问题相关模型
    SurveyQuestion, SurveyQuestionBase, 
    SurveyQuestionCreate, SurveyQuestionUpdate,
    
    # 问卷回答相关模型
    SurveyResponse, SurveyResponseBase,
    SurveyResponseCreate, SurveyResponseUpdate,
    SurveyResponseWithConversations,
    
    # 问卷回答对话相关模型
    SurveyResponseConversation, SurveyResponseConversationBase,
    SurveyResponseConversationCreate, SurveyResponseConversationUpdate,
    
    # 表查询与健康检查相关模型
    TableQueryParams, TableQueryResponse,
    RelatedDataResponse, HealthResponse,
    DatabaseHealthResponse
)

__all__ = [
    # 配置
    'get_supabase',
    
    # DAO类
    'SurveyDAO',
    'SurveyQuestionDAO',
    'SurveyResponseDAO',
    'SurveyResponseConversationDAO',
    
    # 工具函数
    'format_timestamp',
    'test_supabase_connection',
    'get_database_tables_info',
    'query_table',
    'get_by_id',
    'get_related_data',
    
    # 模型 - 所有模型都通过schemas模块导出
    # 基础模型
    'BaseSchema',
    
    # 问卷相关模型
    'Survey', 'SurveyBase', 'SurveyCreate', 'SurveyUpdate',
    'SurveyWithQuestions',
    
    # 问卷问题相关模型
    'SurveyQuestion', 'SurveyQuestionBase', 
    'SurveyQuestionCreate', 'SurveyQuestionUpdate',
    
    # 问卷回答相关模型
    'SurveyResponse', 'SurveyResponseBase',
    'SurveyResponseCreate', 'SurveyResponseUpdate',
    'SurveyResponseWithConversations',
    
    # 问卷回答对话相关模型
    'SurveyResponseConversation', 'SurveyResponseConversationBase',
    'SurveyResponseConversationCreate', 'SurveyResponseConversationUpdate',
    
    # 表查询与健康检查相关模型
    'TableQueryParams', 'TableQueryResponse',
    'RelatedDataResponse', 'HealthResponse',
    'DatabaseHealthResponse'
] 