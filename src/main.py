import logging
import sys
import json
from os import getenv
from pathlib import Path
from aiogram import Bot, Dispatcher
from aiogram.enums.parse_mode import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp.web import run_app, Request, Response, Application


TOKEN = getenv("BOT_TOKEN")
WEB_APP_URL = getenv("WEB_APP_URL")
DATA_FILE = Path("scores.json")

# Load existing data or create empty JSON file
def load_scores():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}

# Save scores to JSON
def save_scores(scores):
    with open(DATA_FILE, "w") as f:
        json.dump(scores, f, indent=4)

async def update_score(request: Request):
    data = await request.json()
    user_id = str(data.get("user_id"))
    score = data.get("score")

    if not user_id or score is None:
        return Response(text="Invalid data", status=400)

    scores = load_scores()
    scores[user_id] = max(scores.get(user_id, 0), score)  # Ensure highest score is saved
    save_scores(scores)

    return Response(text="Score updated")

async def get_score(request: Request):
    user_id = request.query.get("user_id")

    if not user_id:
        return Response(text="User ID required", status=400)

    scores = load_scores()
    return Response(
        text=json.dumps({"score": scores.get(user_id, 0)}),
        content_type="application/json",
    )

async def on_startup(bot: Bot, base_url: str):
    await bot.set_webhook(f"{base_url}/webhook")
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Start Tapping!", web_app=WebAppInfo(url=f"{base_url}/index"))
    )

def main():
    bot = Bot(token=TOKEN, parse_mode=ParseMode.HTML)
    dp = Dispatcher()
    dp["base_url"] = WEB_APP_URL

    dp.startup.register(on_startup)

    app = Application()
    app["bot"] = bot

    app.router.add_post("/update_score", update_score)  
    app.router.add_get("/get_score", get_score)

    setup_application(app, dp, bot=bot)
    run_app(app, host="0.0.0.0", port=80)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    main()
