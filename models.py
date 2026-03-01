from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

trainer_specialization = Table(
    "trainer_specialization",
    Base.metadata,
    Column("trainer_id", Integer, ForeignKey("trainers.id"), primary_key=True),
    Column("specialization_id", Integer, ForeignKey("specializations.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="client")
    hashed_password = Column(String, nullable=False)

    trainer = relationship("Trainer", back_populates="user", uselist=False)
    sessions = relationship("Session", back_populates="user")


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    bio = Column(String, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    user = relationship("User", back_populates="trainer")
    specializations = relationship(
        "Specialization", secondary=trainer_specialization, back_populates="trainers"
    )
    sessions = relationship("Session", back_populates="trainer")


class Specialization(Base):
    __tablename__ = "specializations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    trainers = relationship(
        "Trainer", secondary=trainer_specialization, back_populates="specializations"
    )


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    status = Column(String, default="pending")
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    trainer = relationship("Trainer", back_populates="sessions")
    user = relationship("User", back_populates="sessions")
