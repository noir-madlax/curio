from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body
from sqlalchemy.orm import Session

from ..database import get_db
from ..database.schemas import (
    SurveyResponseConversation, SurveyResponseConversationCreate, SurveyResponseConversationUpdate
)
from ..repository import survey_response_conversation_crud, survey_response_crud

router = APIRouter()


@router.get("/", response_model=List[SurveyResponseConversation])
async def read_conversations(
    response_id: Optional[int] = None,
    speaker_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取对话列表，支持过滤
    """
    if response_id and speaker_type:
        return await survey_response_conversation_crud.get_by_speaker_type(
            db, response_id=response_id, speaker_type=speaker_type
        )
    
    if response_id:
        return await survey_response_conversation_crud.get_by_response_id(
            db, response_id=response_id, skip=skip, limit=limit
        )
        
    filters = {}
    if speaker_type:
        filters["speaker_type"] = speaker_type
        
    return await survey_response_conversation_crud.filter(
        db, filters=filters, skip=skip, limit=limit, order_by="conversation_order"
    )


@router.post("/", response_model=SurveyResponseConversation)
async def create_conversation(
    conversation_in: SurveyResponseConversationCreate,
    db: Session = Depends(get_db)
):
    """
    创建新的对话
    """
    # 检查回复是否存在
    response = await survey_response_crud.get(db, id=conversation_in.survey_response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    return await survey_response_conversation_crud.create(db, obj_in=conversation_in)


@router.post("/bulk", response_model=List[SurveyResponseConversation])
async def create_conversations_bulk(
    response_id: int = Body(...),
    conversations: List[SurveyResponseConversationCreate] = Body(...),
    db: Session = Depends(get_db)
):
    """
    批量创建对话
    """
    # 检查回复是否存在
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    return await survey_response_conversation_crud.bulk_create(db, response_id=response_id, conversations=conversations)


@router.get("/{conversation_id}", response_model=SurveyResponseConversation)
async def read_conversation(
    conversation_id: int = Path(..., title="The ID of the conversation to get"),
    db: Session = Depends(get_db)
):
    """
    根据ID获取对话
    """
    conversation = await survey_response_conversation_crud.get(db, id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.put("/{conversation_id}", response_model=SurveyResponseConversation)
async def update_conversation(
    conversation_id: int = Path(..., title="The ID of the conversation to update"),
    conversation_in: SurveyResponseConversationUpdate = None,
    db: Session = Depends(get_db)
):
    """
    更新对话
    """
    conversation = await survey_response_conversation_crud.get(db, id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return await survey_response_conversation_crud.update(db, db_obj=conversation, obj_in=conversation_in)


@router.delete("/{conversation_id}", response_model=SurveyResponseConversation)
async def delete_conversation(
    conversation_id: int = Path(..., title="The ID of the conversation to delete"),
    db: Session = Depends(get_db)
):
    """
    删除对话
    """
    conversation = await survey_response_conversation_crud.get(db, id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return await survey_response_conversation_crud.remove(db, id=conversation_id)


@router.get("/response/{response_id}/latest", response_model=SurveyResponseConversation)
async def get_latest_conversation(
    response_id: int = Path(..., title="The ID of the response"),
    db: Session = Depends(get_db)
):
    """
    获取特定回复的最新对话
    """
    # 检查回复是否存在
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    conversation = await survey_response_conversation_crud.get_latest_conversation(db, response_id=response_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="No conversations found for this response")
    
    return conversation


@router.get("/response/{response_id}/count", response_model=int)
async def get_conversation_count(
    response_id: int = Path(..., title="The ID of the response"),
    db: Session = Depends(get_db)
):
    """
    获取特定回复的对话数量
    """
    # 检查回复是否存在
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    return await survey_response_conversation_crud.get_conversation_count(db, response_id=response_id)


@router.get("/response/{response_id}/search", response_model=List[SurveyResponseConversation])
async def search_conversations(
    response_id: int = Path(..., title="The ID of the response"),
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """
    在对话文本中搜索
    """
    # 检查回复是否存在
    response = await survey_response_crud.get(db, id=response_id)
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    return await survey_response_conversation_crud.search_in_conversations(db, response_id=response_id, search_text=query)