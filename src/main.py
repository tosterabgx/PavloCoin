import logging
import sys
from os import getenv

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums.parse_mode import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp.web import run_app
from aiohttp.web_app import Application

from handlers import router
from routes import index_handler


TOKEN = getenv("BOT_TOKEN")
WEB_APP_URL = getenv("WEB_APP_URL")


async def on_startup(bot: Bot, base_url: str):
    await bot.set_webhook(f"{base_url}/webhook")
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Start Tapping!", web_app=WebAppInfo(url=f"{base_url}/index"))
    )


def main():
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    
    dp = Dispatcher()
    dp["base_url"] = WEB_APP_URL
    
    dp.startup.register(on_startup)
    dp.include_router(router)

    app = Application()
    app["bot"] = bot
    app.router.add_get("/index", index_handler)
    
    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path="/webhook")
    setup_application(app, dp, bot=bot)

    run_app(app, host="0.0.0.0", port=80)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    main()