from typing import List, Optional
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..database.models import SurveyQuestion
from ..database.schemas import SurveyQuestionCreate, SurveyQuestionUpdate


class CRUDSurveyQuestion(CRUDBase[SurveyQuestion, SurveyQuestionCreate, SurveyQuestionUpdate]):
    """
    SurveyQuestion表的CRUD操作
    """
    
    async def get_by_survey_id(
        self, db: Session, *, survey_id: int, skip: int = 0, limit: int = 100
    ) -> List[SurveyQuestion]:
        """
        根据调查ID获取所有问题，按问题顺序排序
        """
        return (
            db.query(self.model)
            .filter(self.model.survey_id == survey_id)
            .order_by(self.model.question_order)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_by_question_type(
        self, db: Session, *, survey_id: int, question_type: str
    ) -> List[SurveyQuestion]:
        """
        获取特定调查中特定类型的问题
        """
        return (
            db.query(self.model)
            .filter(
                self.model.survey_id == survey_id,
                self.model.question_type == question_type
            )
            .order_by(self.model.question_order)
            .all()
        )
    
    async def update_question_order(
        self, db: Session, *, survey_id: int, question_orders: List[dict]
    ) -> List[SurveyQuestion]:
        """
        批量更新问题顺序
        :param question_orders: 格式 [{"id": question_id, "order": new_order}, ...]
        """
        updated_questions = []
        
        for order_data in question_orders:
            question_id = order_data.get("id")
            new_order = order_data.get("order")
            
            if question_id and new_order is not None:
                question = (
                    db.query(self.model)
                    .filter(
                        self.model.id == question_id,
                        self.model.survey_id == survey_id
                    )
                    .first()
                )
                
                if question:
                    question.question_order = new_order
                    db.add(question)
                    updated_questions.append(question)
        
        db.commit()
        
        # 返回更新后的所有问题
        return self.get_by_survey_id(db, survey_id=survey_id)
    
    async def bulk_create(
        self, db: Session, *, survey_id: int, questions: List[SurveyQuestionCreate]
    ) -> List[SurveyQuestion]:
        """
        批量创建问题
        """
        db_questions = []
        
        for i, question_data in enumerate(questions):
            # 确保问题关联到正确的调查
            question_dict = question_data.dict()
            question_dict["survey_id"] = survey_id
            
            # 如果没有提供顺序，则按列表顺序设置
            if question_dict.get("question_order") is None:
                question_dict["question_order"] = i
                
            db_question = self.model(**question_dict)
            db.add(db_question)
            db_questions.append(db_question)
        
        db.commit()
        
        for question in db_questions:
            db.refresh(question)
            
        return db_questions


survey_question_crud = CRUDSurveyQuestion(SurveyQuestion) 