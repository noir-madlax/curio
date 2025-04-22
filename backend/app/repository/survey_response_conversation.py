from typing import List, Optional
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..database.models import SurveyResponseConversation
from ..database.schemas import SurveyResponseConversationCreate, SurveyResponseConversationUpdate


class CRUDSurveyResponseConversation(CRUDBase[SurveyResponseConversation, SurveyResponseConversationCreate, SurveyResponseConversationUpdate]):
    """
    SurveyResponseConversation表的CRUD操作
    """
    
    async def get_by_response_id(
        self, db: Session, *, response_id: int, skip: int = 0, limit: int = 100
    ) -> List[SurveyResponseConversation]:
        """
        根据回复ID获取所有对话，按对话顺序排序
        """
        return (
            db.query(self.model)
            .filter(self.model.survey_response_id == response_id)
            .order_by(self.model.conversation_order)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_by_speaker_type(
        self, db: Session, *, response_id: int, speaker_type: str
    ) -> List[SurveyResponseConversation]:
        """
        获取特定回复中特定发言者类型的对话
        """
        return (
            db.query(self.model)
            .filter(
                self.model.survey_response_id == response_id,
                self.model.speaker_type == speaker_type
            )
            .order_by(self.model.conversation_order)
            .all()
        )
    
    async def get_latest_conversation(
        self, db: Session, *, response_id: int
    ) -> Optional[SurveyResponseConversation]:
        """
        获取特定回复的最新对话
        """
        return (
            db.query(self.model)
            .filter(self.model.survey_response_id == response_id)
            .order_by(self.model.conversation_order.desc())
            .first()
        )
    
    async def bulk_create(
        self, db: Session, *, response_id: int, conversations: List[SurveyResponseConversationCreate]
    ) -> List[SurveyResponseConversation]:
        """
        批量创建对话
        """
        db_conversations = []
        
        # 获取当前最大顺序号
        max_order = db.query(self.model.conversation_order) \
            .filter(self.model.survey_response_id == response_id) \
            .order_by(self.model.conversation_order.desc()) \
            .first()
        
        start_order = (max_order[0] + 1) if max_order else 0
        
        for i, conversation_data in enumerate(conversations):
            # 确保对话关联到正确的回复
            conversation_dict = conversation_data.dict()
            conversation_dict["survey_response_id"] = response_id
            
            # 如果没有提供顺序，则按列表顺序设置
            if conversation_dict.get("conversation_order") is None:
                conversation_dict["conversation_order"] = start_order + i
                
            db_conversation = self.model(**conversation_dict)
            db.add(db_conversation)
            db_conversations.append(db_conversation)
        
        db.commit()
        
        for conversation in db_conversations:
            db.refresh(conversation)
            
        return db_conversations
    
    async def get_conversation_count(
        self, db: Session, *, response_id: int
    ) -> int:
        """
        获取特定回复的对话数量
        """
        return (
            db.query(self.model)
            .filter(self.model.survey_response_id == response_id)
            .count()
        )
    
    async def search_in_conversations(
        self, db: Session, *, response_id: int, search_text: str
    ) -> List[SurveyResponseConversation]:
        """
        在对话文本中搜索
        """
        search = f"%{search_text}%"
        return (
            db.query(self.model)
            .filter(
                self.model.survey_response_id == response_id,
                self.model.message_text.ilike(search)
            )
            .order_by(self.model.conversation_order)
            .all()
        )


survey_response_conversation_crud = CRUDSurveyResponseConversation(SurveyResponseConversation) 