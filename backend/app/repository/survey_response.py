from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from .base import CRUDBase
from ..database.models import SurveyResponse
from ..database.schemas import SurveyResponseCreate, SurveyResponseUpdate


class CRUDSurveyResponse(CRUDBase[SurveyResponse, SurveyResponseCreate, SurveyResponseUpdate]):
    """
    SurveyResponse表的CRUD操作
    """
    
    async def get_by_survey_id(
        self, db: Session, *, survey_id: int, skip: int = 0, limit: int = 100
    ) -> List[SurveyResponse]:
        """
        根据调查ID获取所有回复
        """
        return (
            db.query(self.model)
            .filter(self.model.survey_id == survey_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_by_respondent(
        self, db: Session, *, respondent_identifier: str, skip: int = 0, limit: int = 100
    ) -> List[SurveyResponse]:
        """
        根据回复者标识获取回复
        """
        return (
            db.query(self.model)
            .filter(self.model.respondent_identifier == respondent_identifier)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_by_status(
        self, db: Session, *, survey_id: int, status: str, skip: int = 0, limit: int = 100
    ) -> List[SurveyResponse]:
        """
        获取特定调查中特定状态的回复
        """
        return (
            db.query(self.model)
            .filter(
                self.model.survey_id == survey_id,
                self.model.status == status
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_response_with_conversations(
        self, db: Session, *, response_id: int
    ) -> Optional[SurveyResponse]:
        """
        获取回复及其对话
        """
        return (
            db.query(self.model)
            .filter(self.model.id == response_id)
            .first()
        )
    
    async def update_status(
        self, db: Session, *, response_id: int, new_status: str
    ) -> Optional[SurveyResponse]:
        """
        更新回复状态
        """
        db_obj = db.query(self.model).filter(self.model.id == response_id).first()
        
        if db_obj:
            db_obj.status = new_status
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
        return db_obj
    
    async def get_statistics(self, db: Session, *, survey_id: int) -> Dict[str, Any]:
        """
        获取调查回复统计信息
        """
        # 总回复数
        total_count = (
            db.query(func.count(self.model.id))
            .filter(self.model.survey_id == survey_id)
            .scalar()
        )
        
        # 按状态分组的回复数
        status_counts = (
            db.query(self.model.status, func.count(self.model.id))
            .filter(self.model.survey_id == survey_id)
            .group_by(self.model.status)
            .all()
        )
        
        # 每天的回复数
        daily_counts = (
            db.query(
                func.date_trunc('day', self.model.created_at).label('day'),
                func.count(self.model.id).label('count')
            )
            .filter(self.model.survey_id == survey_id)
            .group_by('day')
            .order_by('day')
            .all()
        )
        
        # 最近的回复
        recent_responses = (
            db.query(self.model)
            .filter(self.model.survey_id == survey_id)
            .order_by(self.model.created_at.desc())
            .limit(5)
            .all()
        )
        
        return {
            "total_count": total_count,
            "status_counts": {status: count for status, count in status_counts},
            "daily_counts": [{"date": day.isoformat(), "count": count} for day, count in daily_counts],
            "recent_responses": recent_responses
        }


survey_response_crud = CRUDSurveyResponse(SurveyResponse)