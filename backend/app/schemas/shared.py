from datetime import datetime
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Message(ORMModel):
    detail: str


class TimestampedModel(ORMModel):
    created_at: datetime
    updated_at: datetime


T = TypeVar("T")


class PaginatedResponse(GenericModel, Generic[T]):
    total: int
    items: Sequence[T]
