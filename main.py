from aiogram import Bot, types
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from aiogram.dispatcher import Dispatcher
from aiogram.utils import executor

import logging


# Token
token = '7416061984:AAF3wMHZ3D01EIDM2WWjUEvjnR5DDrdL90U'
bot = Bot(token)
dp = Dispatcher(bot)

# Logging
logging.basicConfig(level=logging.INFO)

@dp.message_handler(commands=['start'])
async def process_start_command(message: types.Message):

    markup_inline = InlineKeyboardMarkup()
    item1 = InlineKeyboardButton("Launch Test", web_app=WebAppInfo(url='https://test.yadro.space/'))
    markup_inline.add(item1)
    await bot.send_message(
        message.from_user.id,
        (
            f"Hey @{message.from_user.username}!"
        ),
        reply_markup=markup_inline,
        parse_mode='HTML'
    )

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
