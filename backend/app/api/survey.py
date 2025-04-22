"""
问卷API路由
提供问卷相关的HTTP接口
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from pydantic import BaseModel

from ..services.survey_service import SurveyService, SurveyResponseService
from ..database.schemas import (
    Survey, SurveyCreate, SurveyUpdate,
    SurveyQuestion, SurveyQuestionCreate, SurveyQuestionUpdate,
    SurveyResponse, SurveyResponseCreate,
    SurveyWithQuestions, SurveyResponseWithConversations
)

router = APIRouter()


# 问卷API
@router.post("/", response_model=Survey, status_code=201)
async def create_survey(survey: SurveyCreate):
    """创建新问卷"""
    return await SurveyService.create_survey(survey.dict())


@router.get("/", response_model=List[Survey])
async def list_surveys(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None, description="问卷状态过滤"),
    user_id: Optional[str] = Query(None, description="用户ID过滤")
):
    """获取问卷列表，支持分页和过滤"""
    return await SurveyService.get_all_surveys(limit, offset, status, user_id)


@router.get("/{survey_id}", response_model=Survey)
async def get_survey(survey_id: int = Path(..., ge=1, description="问卷ID")):
    """获取问卷详情"""
    survey = await SurveyService.get_survey(survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return survey


@router.get("/{survey_id}/with-questions", response_model=SurveyWithQuestions)
async def get_survey_with_questions(survey_id: int = Path(..., ge=1, description="问卷ID")):
    """获取问卷及其所有问题"""
    survey = await SurveyService.get_survey_with_questions(survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return survey


@router.patch("/{survey_id}", response_model=Survey)
async def update_survey(
    survey_update: SurveyUpdate,
    survey_id: int = Path(..., ge=1, description="问卷ID")
):
    """更新问卷信息"""
    survey = await SurveyService.update_survey(survey_id, survey_update.dict(exclude_unset=True))
    if not survey:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return survey


@router.delete("/{survey_id}", status_code=204)
async def delete_survey(survey_id: int = Path(..., ge=1, description="问卷ID")):
    """删除问卷"""
    success = await SurveyService.delete_survey(survey_id)
    if not success:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return None


# 问卷问题API
@router.post("/{survey_id}/questions", response_model=SurveyQuestion, status_code=201)
async def add_question(
    question: SurveyQuestionCreate,
    survey_id: int = Path(..., ge=1, description="问卷ID")
):
    """向问卷添加问题"""
    # 检查问卷是否存在
    survey = await SurveyService.get_survey(survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="问卷不存在")
    
    # 创建问题
    question_data = question.dict()
    question_data['survey_id'] = survey_id
    return await SurveyService.add_question_to_survey(survey_id, question_data)


@router.patch("/{survey_id}/questions/{question_id}", response_model=SurveyQuestion)
async def update_question(
    question_update: SurveyQuestionUpdate,
    survey_id: int = Path(..., ge=1, description="问卷ID"),
    question_id: int = Path(..., ge=1, description="问题ID")
):
    """更新问卷问题"""
    # 更新问题
    question = await SurveyService.update_question(question_id, question_update.dict(exclude_unset=True))
    if not question:
        raise HTTPException(status_code=404, detail="问题不存在")
    return question


@router.delete("/{survey_id}/questions/{question_id}", status_code=204)
async def delete_question(
    survey_id: int = Path(..., ge=1, description="问卷ID"),
    question_id: int = Path(..., ge=1, description="问题ID")
):
    """删除问卷问题"""
    success = await SurveyService.delete_question(question_id)
    if not success:
        raise HTTPException(status_code=404, detail="问题不存在")
    return None


# Demo接口 - 获取问卷及其所有问题，作为示例
@router.get("/demo/{survey_id}", response_model=Dict[str, Any])
async def get_survey_demo(survey_id: int = Path(..., ge=1, description="问卷ID")):
    """
    演示接口: 获取问卷详细信息，包括问卷基本信息、问题列表以及回答概况
    """
    # 获取问卷及问题
    survey = await SurveyService.get_survey_with_questions(survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="问卷不存在")
    
    # 获取该问卷的回答数量统计
    responses = await SurveyResponseService.get_responses_by_survey(survey_id)
    
    # 统计回答状态
    status_counts = {}
    for resp in responses:
        status = resp.status or "unknown"
        if status in status_counts:
            status_counts[status] += 1
        else:
            status_counts[status] = 1
    
    # 构建返回结果
    result = {
        "survey": survey.dict(),
        "response_stats": {
            "total_responses": len(responses),
            "status_counts": status_counts
        }
    }
    
    return result 