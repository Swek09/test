from typing import Any, Awaitable, Callable, Coroutine, Dict
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from src.sql.repo import Repo


class DataBaseMiddelware(BaseMiddleware):
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        super().__init__()
        self.session_factory = session_factory

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject, data: Dict[str, Any]
            ) -> Coroutine[Any, Any, Any]:
        async with self.session_factory() as session:
            data["repo"] = Repo(session=session)
            return await handler(event, data)
