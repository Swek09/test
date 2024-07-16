from aiogram import Bot, Dispatcher
from src.bot.bot import register_handlers, register_middlewares

from src.config import settings


async def create_bot_object():
    bot = Bot(token=settings.bot_token)
    await bot.delete_webhook(drop_pending_updates=True)
    return bot


async def start_bot():
    bot = await create_bot_object()
    dp = Dispatcher()
    await register_middlewares(dp)
    await register_handlers(dp)
    await dp.start_polling(bot)
