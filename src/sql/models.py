from datetime import datetime
from typing import List
from sqlalchemy import BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import (Mapped,
                            mapped_column,
                            DeclarativeBase, relationship)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str] = mapped_column()


class Answer(Base):
    __tablename__ = "answer"

    id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    name: Mapped[str] = mapped_column()
    answer: Mapped[str] = mapped_column()
    time: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"))

    task: Mapped["Task"] = relationship("Task", back_populates="answers")


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    image: Mapped[str] = mapped_column()
    urgent: Mapped[bool] = mapped_column()
    likes: Mapped[int] = mapped_column()
    dislikes: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column()
    answers: Mapped[List[Answer]] = relationship("Answer",
                                                 back_populates="task")
