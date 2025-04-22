from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Path

from ..database import query_table, get_by_id, get_related_data
from ..database.schemas import TableQueryResponse

router = APIRouter()

VALID_TABLES = ["cu_survey", "cu_survey_questions", "cu_survey_responses", "cu_survey_response_conversations"]


@router.get("/", response_model=List[str])
async def list_tables() -> List[str]:
    """
    列出所有可查询的表
    """
    return VALID_TABLES


@router.get("/{table}", response_model=TableQueryResponse)
async def get_table_data(
    table: str = Path(..., title="表名"),
    select: str = Query("*", title="要选择的字段，用逗号分隔"),
    limit: int = Query(100, ge=1, le=1000, title="返回记录数量限制"),
    offset: int = Query(0, ge=0, title="跳过的记录数量")
) -> TableQueryResponse:
    """
    获取指定表的数据
    """
    if table not in VALID_TABLES:
        raise HTTPException(status_code=404, detail=f"表 '{table}' 不存在")
    
    data = await query_table(table, select, limit=limit, offset=offset)
    return TableQueryResponse(data=data, count=len(data))


@router.get("/{table}/{id}", response_model=Dict[str, Any])
async def get_record_by_id(
    table: str = Path(..., title="表名"),
    id: int = Path(..., title="记录ID"),
    select: str = Query("*", title="要选择的字段，用逗号分隔")
) -> Dict[str, Any]:
    """
    通过ID获取表中的特定记录
    """
    if table not in VALID_TABLES:
        raise HTTPException(status_code=404, detail=f"表 '{table}' 不存在")
    
    record = await get_by_id(table, id, select)
    if not record:
        raise HTTPException(status_code=404, detail=f"ID为 {id} 的记录不存在")
    
    return record


@router.get("/{table}/{id}/related", response_model=Dict[str, Any])
async def get_record_with_related_data(
    table: str = Path(..., title="表名"),
    id: int = Path(..., title="记录ID")
) -> Dict[str, Any]:
    """
    获取记录及其关联数据
    """
    if table not in VALID_TABLES:
        raise HTTPException(status_code=404, detail=f"表 '{table}' 不存在")
    
    record = await get_by_id(table, id)
    if not record:
        raise HTTPException(status_code=404, detail=f"ID为 {id} 的记录不存在")
    
    result = {"main_record": record, "related_records": {}}
    
    # 根据表名确定关联
    if table == "cu_survey":
        # 问卷关联的问题
        questions = await get_related_data("cu_survey_questions", "survey_id", id)
        result["related_records"]["questions"] = questions
        
        # 问卷关联的回复
        responses = await get_related_data("cu_survey_responses", "survey_id", id)
        result["related_records"]["responses"] = responses
        
    elif table == "cu_survey_responses":
        # 回复关联的对话
        conversations = await get_related_data("cu_survey_response_conversations", "survey_response_id", id)
        result["related_records"]["conversations"] = conversations
    
    return result 