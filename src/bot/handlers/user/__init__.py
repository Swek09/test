from aiogram import Router
from .basic import basic_router

user_router = Router()

user_router.include_router(basic_router)

__all__ = ["user_router"]
