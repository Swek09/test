from aiogram import Router, F
from .sender import sender_router

from src.config import settings

admin_router = Router()
admin_router.message.filter(F.from_user.id.in_(settings.admins))
admin_router.callback_query.filter(F.from_user.id.in_(settings.admins))
admin_router.include_router(sender_router)

__all__ = ["admin_router"]
