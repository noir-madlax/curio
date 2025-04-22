from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.schemas import (
    Survey, SurveyCreate, SurveyUpdate, SurveyWithDetails
)
from ..repository import survey_crud

router = APIRouter()


@router.get("/", response_model=List[Survey])
async def read_surveys(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取调查列表，支持过滤
    """
    filters = {}
    if user_id:
        filters["user_id"] = user_id
    if status:
        filters["status"] = status
    if language:
        filters["language"] = language
        
    return await survey_crud.filter(db, filters=filters, skip=skip, limit=limit, order_by="-created_at")


@router.post("/", response_model=Survey)
async def create_survey(
    survey_in: SurveyCreate,
    db: Session = Depends(get_db)
):
    """
    创建新调查
    """
    return await survey_crud.create(db, obj_in=survey_in)


@router.get("/statistics", response_model=Dict[str, Any])
async def get_survey_statistics(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    获取调查统计信息
    """
    return await survey_crud.get_statistics(db, user_id=user_id)


@router.get("/{survey_id}", response_model=Survey)
async def read_survey(
    survey_id: int = Path(..., title="The ID of the survey to get"),
    db: Session = Depends(get_db)
):
    """
    根据ID获取调查
    """
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


@router.get("/{survey_id}/details", response_model=SurveyWithDetails)
async def read_survey_with_details(
    survey_id: int = Path(..., title="The ID of the survey to get with details"),
    db: Session = Depends(get_db)
):
    """
    获取调查及其关联的问题和回复
    """
    survey = await survey_crud.get_survey_with_related(db, survey_id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


@router.put("/{survey_id}", response_model=Survey)
async def update_survey(
    survey_id: int = Path(..., title="The ID of the survey to update"),
    survey_in: SurveyUpdate = None,
    db: Session = Depends(get_db)
):
    """
    更新调查
    """
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_crud.update(db, db_obj=survey, obj_in=survey_in)


@router.delete("/{survey_id}", response_model=Survey)
async def delete_survey(
    survey_id: int = Path(..., title="The ID of the survey to delete"),
    db: Session = Depends(get_db)
):
    """
    删除调查
    """
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_crud.remove(db, id=survey_id)


@router.get("/search/", response_model=List[Survey])
async def search_surveys(
    query: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    搜索调查
    """
    return await survey_crud.search_surveys(db, query=query, skip=skip, limit=limit) 