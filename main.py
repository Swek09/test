import json
import re
from aiogram import Bot, types
from aiogram.types import (InlineKeyboardButton,
                           InlineKeyboardMarkup, WebAppInfo)
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher import Dispatcher
from aiogram.dispatcher.filters.state import StatesGroup, State
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.utils import executor
from aiogram.types import CallbackQuery, ContentType
import logging
import urllib.parse

token = '7416061984:AAF3wMHZ3D01EIDM2WWjUEvjnR5DDrdL90U'
bot = Bot(token)
dp = Dispatcher(bot, storage=MemoryStorage())
ADMIN_IDS = [304301801, 5198857407]

logging.basicConfig(level=logging.INFO, filemode='a')


class SenderStates(StatesGroup):
    message = State()


def update_settings():
    with open('settings.json', 'r') as file:
        settings = json.load(file)
    settings[0]["access"] = "True"
    with open('settings.json', 'w') as file:
        json.dump(settings, file, indent=4)


async def get_users():
    try:
        with open('user_ids.json', 'r') as file:
            user_ids = json.load(file)
    except FileNotFoundError:
        user_ids = []
    return user_ids


async def save_message_content(message: types.Message):
    content = {
        "user_id": message.from_user.id,
        "username": message.from_user.username,
        "first_name": message.from_user.first_name,
        "text": message.text if message.text else message.caption,
        "media": None
    }

    if message.photo:
        file_id = message.photo[-1].file_id
        file = await bot.get_file(file_id)
        file_path = file.file_path
        await bot.download_file(file_path, "photo.jpg")
        content["media"] = {"type": "photo",
                            "file_name": "photo.jpg"}

    with open('messages.json', 'w', encoding='utf-8') as file:
        json.dump(content, file, ensure_ascii=False, indent=4)


def update_user_ids(message):
    try:
        with open('user_ids.json', 'r') as file:
            user_ids = json.load(file)
    except FileNotFoundError:
        user_ids = []

    user_id = message.from_user.id
    if user_id not in user_ids:
        user_ids.append(user_id)

    with open('user_ids.json', 'w') as file:
        json.dump(user_ids, file, indent=4)


@dp.message_handler(commands=['start'], state='*')
async def process_start_command(message: types.Message):
    update_user_ids(message)
    user_data = {
        "user_id": message.from_user.id,
        "username": message.from_user.username,
        "first": message.from_user.first_name
    }
    encoded_data = urllib.parse.urlencode(user_data)
    web_app_url = f'https://test.yadro.space/?{encoded_data}'

    markup_inline = InlineKeyboardMarkup()
    item1 = InlineKeyboardButton("Launch Test",
                                 web_app=WebAppInfo(url=web_app_url))
    if message.from_user.id in ADMIN_IDS:
        item2 = InlineKeyboardButton("Открыть доступ",
                                     callback_data='change_settings')
        item3 = InlineKeyboardButton("Рассылка", callback_data='send')
        markup_inline.add(item2, item3)
    markup_inline.add(item1)

    await bot.send_message(
        message.from_user.id,
        f"Hey @{message.from_user.username}!",
        reply_markup=markup_inline,
        parse_mode='HTML'
    )


@dp.callback_query_handler(lambda c: c.data == 'change_settings', state='*')
async def process_callback_change_settings(callback_query: CallbackQuery):
    update_settings()
    await bot.answer_callback_query(callback_query.id)
    await bot.send_message(callback_query.from_user.id,
                           "Settings updated successfully!")


async def send_messages_to_users():
    with open('user_ids.json', 'r') as f:
        user_ids = json.load(f)
    for user_id in user_ids:
        try:
            await bot.send_message(user_id, "Ваше сообщение здесь")
            print(f"Сообщение отправлено пользователю с ID {user_id}")
        except Exception as e:
            print(f"Ошибка при отправке сообщения пользователю {user_id}: {e}")


@dp.callback_query_handler(lambda c: c.data == 'send', state='*')
async def process_callback_send(callback_query: CallbackQuery,
                                state: FSMContext):
    await state.set_state(SenderStates.message.state)
    await bot.send_message(callback_query.from_user.id,
                           "Введите сообщение для рассылки:")


@dp.message_handler(state=SenderStates.message,
                    content_types=ContentType.PHOTO)
async def process_message(message: types.Message, state: FSMContext):
    print(123)
    await save_message_content(message)
    users = await get_users()
    for user in users:
        try:
            await message.send_copy(chat_id=user)
        except Exception as e:
            print(f"Ошибка при отправке сообщения пользователю {user}: {e}")
    await state.finish()


@dp.message_handler(state=SenderStates.message)
async def process_message_text(message: types.Message, state: FSMContext):
    print(123)
    save_message_content(message)
    users = await get_users()
    for user in users:
        try:
            await message.send_copy(chat_id=user)
        except Exception as e:
            print(f"Ошибка при отправке сообщения пользователю {user}: {e}")
    await state.finish()


@dp.callback_query_handler(lambda c: c.data == 'confirm', state='*')
async def process_callback_confirm(callback_query: types.CallbackQuery):
    text = callback_query.message.caption

    id_match = re.search(r'ID: (\d+)', text)

    if id_match:
        task_id = int(id_match.group(1))
        try:
            with open('data.json', 'r', encoding='utf-8') as file:
                tasks = json.load(file)

            task_found = False
            for task in tasks:
                if task['id'] == task_id:
                    task['status'] = 'done'
                    task_found = True
                    break

            if task_found:
                with open('data.json', 'w', encoding='utf-8') as file:
                    json.dump(tasks, file, ensure_ascii=False, indent=2)

                await bot.send_message(callback_query.message.chat.id,
                                       (f"ID {task_id};\n\nЗадание "
                                        "зарегистрировано как выполненное!"))
            else:
                await bot.send_message(callback_query.message.chat.id,
                                       f"ID {task_id};\n\nЗадача не найдена.")
        except FileNotFoundError:
            await bot.send_message(callback_query.message.chat.id,
                                   "Файл данных не найден.")
        except json.JSONDecodeError:
            await bot.send_message(callback_query.message.chat.id,
                                   "Ошибка чтения данных.")
    else:
        await bot.send_message(callback_query.message.chat.id,
                               "ID не найден в сообщении.")


@dp.callback_query_handler(lambda c: c.data == 'reject', state='*')
async def process_callback_reject(callback_query: CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    await bot.send_message(callback_query.from_user.id, "Изменения отклонены.")


if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
