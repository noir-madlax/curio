from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from .base import CRUDBase
from ..database.models import Survey
from ..database.schemas import SurveyCreate, SurveyUpdate


class CRUDSurvey(CRUDBase[Survey, SurveyCreate, SurveyUpdate]):
    """
    Survey表的CRUD操作
    """
    
    async def get_by_user_id(self, db: Session, *, user_id: str) -> List[Survey]:
        """
        根据用户ID获取所有调查
        """
        return db.query(self.model).filter(self.model.user_id == user_id).all()
    
    async def get_by_status(self, db: Session, *, status: str, skip: int = 0, limit: int = 100) -> List[Survey]:
        """
        根据状态获取调查
        """
        return db.query(self.model).filter(self.model.status == status).offset(skip).limit(limit).all()
    
    async def search_surveys(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Survey]:
        """
        全文搜索调查（标题和描述）
        """
        search = f"%{query}%"
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.title.ilike(search),
                    self.model.description.ilike(search)
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_surveys_by_language(
        self, db: Session, *, language: str, skip: int = 0, limit: int = 100
    ) -> List[Survey]:
        """
        根据语言过滤调查
        """
        return db.query(self.model).filter(self.model.language == language).offset(skip).limit(limit).all()
    
    async def get_survey_with_related(
        self, db: Session, *, survey_id: int
    ) -> Optional[Survey]:
        """
        获取调查及其相关问题和响应
        """
        return (
            db.query(self.model)
            .filter(self.model.id == survey_id)
            .first()
        )
    
    async def get_statistics(self, db: Session, *, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        获取调查统计信息
        """
        query = db.query(self.model)
        
        if user_id:
            query = query.filter(self.model.user_id == user_id)
        
        # 获取总调查数
        total_count = query.count()
        
        # 按状态分组的调查数
        status_counts = (
            db.query(self.model.status, func.count(self.model.id))
            .filter(self.model.user_id == user_id if user_id else True)
            .group_by(self.model.status)
            .all()
        )
        
        # 按语言分组的调查数
        language_counts = (
            db.query(self.model.language, func.count(self.model.id))
            .filter(self.model.user_id == user_id if user_id else True)
            .group_by(self.model.language)
            .all()
        )
        
        # 最近创建的调查
        recent_surveys = (
            query.order_by(self.model.created_at.desc())
            .limit(5)
            .all()
        )
        
        return {
            "total_count": total_count,
            "status_counts": {status: count for status, count in status_counts},
            "language_counts": {language: count for language, count in language_counts},
            "recent_surveys": recent_surveys
        }


survey_crud = CRUDSurvey(Survey) 