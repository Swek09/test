import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    bot_token: str = os.getenv("BOT_TOKEN")
    db_url: str = os.getenv("DB_URL")
    web_app_url: str = os.getenv("WEB_APP_URL")
    admins: list = [int(id) for id in os.getenv("ADMINS").split(",")]


settings = Settings()
