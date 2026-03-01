import logging
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_password_hash
from database import Base, engine, get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fitconnect")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitConnect API", version="1.0.0")


@app.post(
    "/api/trainers/register",
    response_model=schemas.TrainerRead,
    status_code=status.HTTP_201_CREATED,
)
def register_trainer(trainer_in: schemas.TrainerCreate, db: Session = Depends(get_db)):
    """Register a new trainer with their user account."""
    logger.info("Registering trainer with email: %s", trainer_in.user.email)

    existing = db.query(models.User).filter(models.User.email == trainer_in.user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_pw = get_password_hash(trainer_in.user.password)
    db_user = models.User(
        email=trainer_in.user.email,
        name=trainer_in.user.name,
        role="trainer",
        hashed_password=hashed_pw,
    )
    db.add(db_user)
    db.flush()

    specializations = (
        db.query(models.Specialization)
        .filter(models.Specialization.id.in_(trainer_in.specialization_ids))
        .all()
    )

    db_trainer = models.Trainer(
        bio=trainer_in.bio,
        hourly_rate=trainer_in.hourly_rate,
        location=trainer_in.location,
        user_id=db_user.id,
        specializations=specializations,
    )
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)

    logger.info("Trainer registered successfully with id: %d", db_trainer.id)
    return db_trainer


@app.get("/api/trainers/search", response_model=List[schemas.TrainerRead])
def search_trainers(
    location: Optional[str] = Query(None, description="Filter by location"),
    specialization: Optional[str] = Query(None, description="Filter by specialization name"),
    max_rate: Optional[float] = Query(None, description="Filter by maximum hourly rate"),
    db: Session = Depends(get_db),
):
    """Search trainers with optional filters."""
    logger.info(
        "Searching trainers - location=%s, specialization=%s, max_rate=%s",
        location,
        specialization,
        max_rate,
    )

    query = db.query(models.Trainer)

    if location:
        query = query.filter(models.Trainer.location.ilike(f"%{location}%"))
    if specialization:
        query = query.join(models.Trainer.specializations).filter(
            models.Specialization.name.ilike(f"%{specialization}%")
        )
    if max_rate is not None:
        query = query.filter(models.Trainer.hourly_rate <= max_rate)

    trainers = query.all()
    logger.info("Found %d trainers", len(trainers))
    return trainers


@app.post(
    "/api/sessions",
    response_model=schemas.SessionRead,
    status_code=status.HTTP_201_CREATED,
)
def book_session(session_in: schemas.SessionCreate, db: Session = Depends(get_db)):
    """Book a training session."""
    logger.info(
        "Booking session - trainer_id=%d, user_id=%d, date=%s",
        session_in.trainer_id,
        session_in.user_id,
        session_in.date,
    )

    trainer = db.query(models.Trainer).filter(models.Trainer.id == session_in.trainer_id).first()
    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer not found",
        )

    user = db.query(models.User).filter(models.User.id == session_in.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db_session = models.Session(
        date=session_in.date,
        time=session_in.time,
        status=session_in.status,
        trainer_id=session_in.trainer_id,
        user_id=session_in.user_id,
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    logger.info("Session booked with id: %d", db_session.id)
    return db_session
