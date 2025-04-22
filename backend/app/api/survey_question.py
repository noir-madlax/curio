from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Path, Body
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.schemas import (
    SurveyQuestion, SurveyQuestionCreate, SurveyQuestionUpdate
)
from ..repository import survey_question_crud, survey_crud

router = APIRouter()


@router.get("/", response_model=List[SurveyQuestion])
async def read_questions(
    survey_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取问题列表，可按调查ID过滤
    """
    if survey_id:
        return await survey_question_crud.get_by_survey_id(db, survey_id=survey_id, skip=skip, limit=limit)
    
    return await survey_question_crud.get_multi(db, skip=skip, limit=limit)


@router.post("/", response_model=SurveyQuestion)
async def create_question(
    question_in: SurveyQuestionCreate,
    db: Session = Depends(get_db)
):
    """
    创建新问题
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=question_in.survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_question_crud.create(db, obj_in=question_in)


@router.post("/bulk", response_model=List[SurveyQuestion])
async def create_questions_bulk(
    survey_id: int = Body(...),
    questions: List[SurveyQuestionCreate] = Body(...),
    db: Session = Depends(get_db)
):
    """
    批量创建问题
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_question_crud.bulk_create(db, survey_id=survey_id, questions=questions)


@router.get("/{question_id}", response_model=SurveyQuestion)
async def read_question(
    question_id: int = Path(..., title="The ID of the question to get"),
    db: Session = Depends(get_db)
):
    """
    根据ID获取问题
    """
    question = await survey_question_crud.get(db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/{question_id}", response_model=SurveyQuestion)
async def update_question(
    question_id: int = Path(..., title="The ID of the question to update"),
    question_in: SurveyQuestionUpdate = None,
    db: Session = Depends(get_db)
):
    """
    更新问题
    """
    question = await survey_question_crud.get(db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return await survey_question_crud.update(db, db_obj=question, obj_in=question_in)


@router.delete("/{question_id}", response_model=SurveyQuestion)
async def delete_question(
    question_id: int = Path(..., title="The ID of the question to delete"),
    db: Session = Depends(get_db)
):
    """
    删除问题
    """
    question = await survey_question_crud.get(db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return await survey_question_crud.remove(db, id=question_id)


@router.put("/survey/{survey_id}/reorder", response_model=List[SurveyQuestion])
async def reorder_questions(
    survey_id: int = Path(..., title="The ID of the survey"),
    question_orders: List[Dict[str, Any]] = Body(..., example=[{"id": 1, "order": 0}, {"id": 2, "order": 1}]),
    db: Session = Depends(get_db)
):
    """
    重新排序调查问题
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_question_crud.update_question_order(db, survey_id=survey_id, question_orders=question_orders)


@router.get("/type/{question_type}", response_model=List[SurveyQuestion])
async def get_questions_by_type(
    question_type: str,
    survey_id: int,
    db: Session = Depends(get_db)
):
    """
    根据问题类型获取问题
    """
    # 检查调查是否存在
    survey = await survey_crud.get(db, id=survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return await survey_question_crud.get_by_question_type(db, survey_id=survey_id, question_type=question_type) 