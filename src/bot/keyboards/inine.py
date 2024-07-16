from aiogram.types import (InlineKeyboardMarkup,
                           InlineKeyboardButton, WebAppInfo)


def generate_web_app_keyboard(admin: bool, url: str):
    if admin:
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="Launch Test",
                                     web_app=WebAppInfo(url=url))
            ],
            [
                InlineKeyboardButton(text="Открыть доступ",
                                     callback_data="change_settings"),
                InlineKeyboardButton(text="Рассылка",
                                     callback_data="send")
            ]
        ])
    else:
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="Launch Test",
                                     web_app=WebAppInfo(url=url))
            ]
        ])
    return keyboard
