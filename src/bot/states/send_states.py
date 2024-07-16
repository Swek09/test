from aiogram.fsm.state import State, StatesGroup


class SendStates(StatesGroup):
    message = State()
