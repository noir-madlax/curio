from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.schemas import (
    SurveyResponse, SurveyResponseCreate, SurveyResponseUpdate, SurveyResponseWithConversations
)
from ..repository import survey_response_crud, survey_crud

router = APIRouter()


@router.get("/", response_model=List[SurveyResponse])
async def read_responses(
    survey_id: Optional[int] = None,
    respondent_identifier: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取调查回复列表，支持过滤
    """
    if survey_id and status:
        return await survey_response_crud.get_by_status(db, survey_id=survey_id, status=status, skip=skip, limit=limit)
    
    if survey_id:
        return await survey_response_crud.get_by_survey_id(db, survey_id=survey_id, skip=skip, limit=limit)
    
    if respondent_identifier:
        return await survey_response_crud.get_by_respondent(db, respondent_identifier=respondent_identifier, skip=skip, limit=limit)
    
    filters = {}
    if status:
        filters["status"] = status
        
    return await survey_response_crud.filter(db, filters=filters, skip=skip, limit=limit, order_by="-created_at")


@router.post("/", response_model=SurveyResponse)
async def create_response(
    response_in: SurveyResponseCreate,
    db: Session = Depends(get_db)
):
    """
    创建新的调查回复
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=response_in.survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_response_crud.create(db, obj_in=response_in)


@router.get("/statistics/{survey_id}", response_model=Dict[str, Any])
async def get_response_statistics(
    survey_id: int = Path(..., title="The ID of the survey to get statistics for"),
    db: Session = Depends(get_db)
):
    """
    获取特定调查的回复统计信息
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_response_crud.get_statistics(db, survey_id=survey_id)


@router.get("/{response_id}", response_model=SurveyResponse)
async def read_response(
    response_id: int = Path(..., title="The ID of the response to get"),
    db: Session = Depends(get_db)
):
    """
    根据ID获取调查回复
    """
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response


@router.get("/{response_id}/with-conversations", response_model=SurveyResponseWithConversations)
async def read_response_with_conversations(
    response_id: int = Path(..., title="The ID of the response to get with conversations"),
    db: Session = Depends(get_db)
):
    """
    获取调查回复及其对话
    """
    response = await survey_response_crud.get_response_with_conversations(db, response_id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response


@router.put("/{response_id}", response_model=SurveyResponse)
async def update_response(
    response_id: int = Path(..., title="The ID of the response to update"),
    response_in: SurveyResponseUpdate = None,
    db: Session = Depends(get_db)
):
    """
    更新调查回复
    """
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return await survey_response_crud.update(db, db_obj=response, obj_in=response_in)


@router.delete("/{response_id}", response_model=SurveyResponse)
async def delete_response(
    response_id: int = Path(..., title="The ID of the response to delete"),
    db: Session = Depends(get_db)
):
    """
    删除调查回复
    """
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return await survey_response_crud.remove(db, id=response_id)


@router.put("/{response_id}/status", response_model=SurveyResponse)
async def update_response_status(
    response_id: int = Path(..., title="The ID of the response to update status"),
    status: str = Query(..., title="The new status to set"),
    db: Session = Depends(get_db)
):
    """
    更新调查回复状态
    """
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return await survey_response_crud.update_status(db, response_id=response_id, new_status=status)