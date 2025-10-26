from typing import Optional

from pydantic import Field

from app.schemas.shared import ORMModel, TimestampedModel


class RolBase(ORMModel):
    name: str = Field(min_length=3, max_length=50)
    description: Optional[str] = Field(default=None, max_length=255)


class RolCreate(RolBase):
    pass


class RolUpdate(ORMModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RolOut(RolBase, TimestampedModel):
    id: int
