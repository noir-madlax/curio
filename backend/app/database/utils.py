from typing import Dict, Any, List, Optional
from .config import get_supabase

async def test_supabase_connection() -> bool:
    """
    测试Supabase客户端连接是否正常
    """
    try:
        supabase = get_supabase()
        # 执行简单查询测试连接
        response = supabase.table('cu_survey').select('id').limit(1).execute()
        return True
    except Exception as e:
        print(f"Supabase连接测试失败: {str(e)}")
        return False


async def get_database_tables_info() -> dict:
    """
    获取Supabase表信息
    """
    tables = ["cu_survey", "cu_survey_questions", "cu_survey_responses", "cu_survey_response_conversations"]
    tables_info = {table: {"description": f"{table} 表"} for table in tables}
    return tables_info


async def query_table(table_name: str, select_fields: str = "*", 
                      filters: Dict[str, Any] = None, 
                      limit: int = 100, 
                      offset: int = 0) -> List[Dict[str, Any]]:
    """
    使用Supabase客户端查询数据
    
    :param table_name: 表名
    :param select_fields: 要选择的字段，默认为 "*"
    :param filters: 过滤条件
    :param limit: 限制返回的记录数
    :param offset: 跳过的记录数
    :return: 查询结果
    """
    try:
        supabase = get_supabase()
        query = supabase.table(table_name).select(select_fields)
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.limit(limit).offset(offset).execute()
        return result.data
    except Exception as e:
        print(f"Supabase查询失败: {str(e)}")
        return []


async def get_by_id(table_name: str, id: int, select_fields: str = "*") -> Optional[Dict[str, Any]]:
    """
    通过ID获取记录
    
    :param table_name: 表名
    :param id: 记录ID
    :param select_fields: 要选择的字段
    :return: 记录或None
    """
    results = await query_table(table_name, select_fields, {"id": id}, 1, 0)
    return results[0] if results else None


async def get_related_data(table_name: str, foreign_key: str, value: Any, 
                           select_fields: str = "*", 
                           limit: int = 100) -> List[Dict[str, Any]]:
    """
    获取关联数据
    
    :param table_name: 关联表名
    :param foreign_key: 外键字段名
    :param value: 外键值
    :param select_fields: 要选择的字段
    :param limit: 限制返回的记录数
    :return: 关联数据列表
    """
    return await query_table(table_name, select_fields, {foreign_key: value}, limit, 0) 