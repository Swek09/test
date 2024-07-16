from aiogram import Router, F
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.exceptions import TelegramBadRequest
from aiogram.types import CallbackQuery, Message

from src.sql.repo import Repo
from src.bot.states.send_states import SendStates

sender_router = Router()


@sender_router.callback_query(F.data == "send")
async def process_callback_send(call: CallbackQuery, state: FSMContext):
    await state.set_state(SendStates.message)
    text = ("Пришлите сообщение для рассылки\n"
            "Для выхода в главное меню напишите /back")
    await call.message.answer(text=text)
    await call.answer()


@sender_router.message(StateFilter(SendStates.message))
async def process_send_message(message: Message,
                               state: FSMContext, repo: Repo):
    users = await repo.get_all_users()
    success = 0
    for user in users:
        try:
            await message.copy_to(user.id)
            success += 1
        except TelegramBadRequest:
            pass
    await message.answer(text=("Рассылка завершена\n"
                               f"Отправлено {success} сообщений"
                               f" из {len(users)}"))
    await state.clear()
