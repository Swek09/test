from aiogram import Dispatcher
from src.sql.db import create_pool
from src.bot.handlers.user import user_router
from src.bot.handlers.admin import admin_router
from src.bot.middlewares.db_middleware import DataBaseMiddelware

from src.config import settings


session_factory = create_pool(settings.db_url)


async def register_middlewares(dp: Dispatcher):
    dp.update.outer_middleware(DataBaseMiddelware(session_factory))
    return dp


async def register_handlers(dp: Dispatcher):
    dp.include_router(admin_router)
    dp.include_router(user_router)
    return dp
