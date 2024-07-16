import urllib
from aiogram import Router, F
from aiogram.types import Message

from src.sql.repo import Repo
from src.bot.keyboards.inine import generate_web_app_keyboard

from src.config import settings

basic_router = Router()


@basic_router.message(F.text == "/start")
async def on_start(message: Message, repo: Repo):
    await repo.create_user(user_id=message.from_user.id,
                           username=message.from_user.full_name)
    await message.answer("Привет")
    user_data = {
        "user_id": message.from_user.id,
        "username": message.from_user.username,
        "first": message.from_user.first_name
    }
    encoded_data = urllib.parse.urlencode(user_data)
    web_app_url = settings.web_app_url.format(encoded_data)
    admin = False
    if message.from_user.id in settings.admins:
        admin = True
    keyboard = generate_web_app_keyboard(url=web_app_url,
                                         admin=admin)
    await message.answer(text=f"Hey @{message.from_user.username}!",
                         reply_markup=keyboard)
