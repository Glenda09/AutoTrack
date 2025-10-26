from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy.orm import Session

from app.db.base import Base


ModelType = TypeVar("ModelType", bound=Base)


class GenericRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType]) -> None:
        self.model = model

    def get(self, db: Session, obj_id: Any) -> ModelType | None:
        return db.get(self.model, obj_id)

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, obj_in: dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, db_obj: ModelType) -> None:
        db.delete(db_obj)
        db.commit()
