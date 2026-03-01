from pydantic import BaseModel, EmailStr
from typing import Optional, List


# Specialization schemas
class SpecializationBase(BaseModel):
    name: str


class SpecializationCreate(SpecializationBase):
    pass


class SpecializationRead(SpecializationBase):
    id: int

    model_config = {"from_attributes": True}


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "client"


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int

    model_config = {"from_attributes": True}


# Trainer schemas
class TrainerBase(BaseModel):
    bio: Optional[str] = None
    hourly_rate: float
    location: str
    specialization_ids: List[int] = []


class TrainerCreate(TrainerBase):
    user: UserCreate


class TrainerRead(TrainerBase):
    id: int
    user_id: int
    user: UserRead
    specializations: List[SpecializationRead] = []

    model_config = {"from_attributes": True}


# Session schemas
class SessionBase(BaseModel):
    date: str
    time: str
    status: str = "pending"
    trainer_id: int
    user_id: int


class SessionCreate(SessionBase):
    pass


class SessionRead(SessionBase):
    id: int

    model_config = {"from_attributes": True}
