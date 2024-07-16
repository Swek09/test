import asyncio
import logging
from src.main import start_bot


async def main():
    await start_bot()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
