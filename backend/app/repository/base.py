from typing import Generic, TypeVar, Type, Any, Optional, List, Union, Dict
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from sqlalchemy import desc

from ..database.models import Base

# 定义通用类型变量
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    基础CRUD操作类
    """
    
    def __init__(self, model: Type[ModelType]):
        """
        CRUD操作初始化
        :param model: 要操作的SQLAlchemy模型类
        """
        self.model = model
    
    async def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        根据ID获取模型实例
        """
        try:
            return db.query(self.model).filter(self.model.id == id).first()
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, order_by: str = None
    ) -> List[ModelType]:
        """
        获取多个模型实例
        """
        try:
            query = db.query(self.model)
            
            if order_by:
                if order_by.startswith("-"):
                    order_field = getattr(self.model, order_by[1:])
                    query = query.order_by(desc(order_field))
                else:
                    order_field = getattr(self.model, order_by)
                    query = query.order_by(order_field)
            
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def filter(
        self, db: Session, *, filters: Dict[str, Any], skip: int = 0, limit: int = 100, order_by: str = None
    ) -> List[ModelType]:
        """
        根据过滤条件获取多个模型实例
        """
        try:
            query = db.query(self.model)
            
            for field, value in filters.items():
                if isinstance(value, list):
                    query = query.filter(getattr(self.model, field).in_(value))
                else:
                    query = query.filter(getattr(self.model, field) == value)
            
            if order_by:
                if order_by.startswith("-"):
                    order_field = getattr(self.model, order_by[1:])
                    query = query.order_by(desc(order_field))
                else:
                    order_field = getattr(self.model, order_by)
                    query = query.order_by(order_field)
            
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        创建新的模型实例
        """
        try:
            obj_in_data = jsonable_encoder(obj_in)
            db_obj = self.model(**obj_in_data)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def update(
        self, db: Session, *, db_obj: ModelType, obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        更新模型实例
        """
        try:
            obj_data = jsonable_encoder(db_obj)
            
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.dict(exclude_unset=True)
                
            for field in obj_data:
                if field in update_data:
                    setattr(db_obj, field, update_data[field])
                    
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def remove(self, db: Session, *, id: Any) -> ModelType:
        """
        删除模型实例
        """
        try:
            obj = db.query(self.model).get(id)
            db.delete(obj)
            db.commit()
            return obj
        except SQLAlchemyError as e:
            db.rollback()
            raise e
    
    async def count(self, db: Session, *, filters: Dict[str, Any] = None) -> int:
        """
        计算符合条件的记录数
        """
        try:
            query = db.query(self.model)
            
            if filters:
                for field, value in filters.items():
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
            
            return query.count()
        except SQLAlchemyError as e:
            db.rollback()
            raise e 