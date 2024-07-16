from typing import Optional, Sequence
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.sql.models import User


class UserRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, user_id: int, username: str) -> User:
        user = User(id=user_id, username=username)
        check = await self.get_user(user_id=user_id)
        if not check:
            self.session.add(user)
            await self.session.commit()
        return user

    async def get_user(self, user_id: int) -> Optional[User]:
        return await self.session.get(User, user_id)

    async def get_all_users(self) -> Sequence[User]:
        stmt = select(User)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_user(self, user_id: int, **kwargs) -> None:
        stmt = update(User).where(User.id == user_id).values(**kwargs)
        await self.session.execute(stmt)
        await self.session.commit()

    async def delete_user(self, user_id: int) -> None:
        stmt = delete(User).where(User.id == user_id)
        await self.session.execute(stmt)
        await self.session.commit()
