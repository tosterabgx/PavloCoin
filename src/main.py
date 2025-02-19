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
from aiogram.client.default import DefaultBotProperties
from handlers import router
from routes import index_handler, get_path_static
from aiohttp import web
from middleware import security_middleware, rate_limit_middleware
import hashlib
import hmac
from typing import Optional
from cryptography.fernet import Fernet
import base64
import time
import os

# Use one of the environment variables
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("Telegram bot token is not set (check TELEGRAM_BOT_TOKEN or BOT_TOKEN)!")

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

class SecureWebApp:
    def __init__(self, bot_token: str):
        # Generate secret key based on bot token
        self.secret_key = hashlib.sha256(bot_token.encode()).digest()
        # Initialize Fernet for data encryption
        self.fernet = Fernet(base64.urlsafe_b64encode(self.secret_key))

    def validate_telegram_hash(self, init_data: str, hash: str) -> bool:
        """Validate Telegram Web App init data"""
        if not init_data or not hash:
            return False
        
        # Calculate data_check_string
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(
                x.split('=') for x in init_data.split('&')
                if x.split('=')[0] != 'hash'
            )
        )
        
        # Calculate secret key
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=self.bot_token.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        return calculated_hash == hash

    def encrypt_data(self, data: dict) -> str:
        """Encrypt data before saving"""
        return self.fernet.encrypt(json.dumps(data).encode()).decode()

    def decrypt_data(self, encrypted_data: str) -> Optional[dict]:
        """Decrypt data after loading"""
        try:
            return json.loads(self.fernet.decrypt(encrypted_data.encode()).decode())
        except Exception:
            return None

async def update_score(request: Request):
    secure_app = request.app["secure"]
    
    # Get init data from header
    init_data = request.headers.get("X-Telegram-Init-Data")
    if not init_data:
        return web.Response(status=403, text="Missing authentication")

    try:
        data = await request.json()
        user_id = str(data.get("user_id"))
        new_score = data.get("score")
        new_level = data.get("level")
        new_earn_per_tap = data.get("earnPerTap")
        new_level_up_threshold = data.get("levelUpThreshold")
        timestamp = data.get("timestamp")
        current_time = time.time()

        # Load previous state
        scores = load_scores()
        prev_data = None
        if user_id in scores:
            try:
                prev_data = secure_app.decrypt_data(scores[user_id])
            except Exception:
                prev_data = {
                    "score": 0,
                    "level": 1,
                    "earnPerTap": 1,
                    "levelUpThreshold": 100,
                    "energyLeft": 1000,
                    "maxEnergy": 1000,
                    "lastResetTime": current_time
                }
        else:
            prev_data = {
                "score": 0,
                "level": 1,
                "earnPerTap": 1,
                "levelUpThreshold": 100,
                "energyLeft": 1000,
                "maxEnergy": 1000,
                "lastResetTime": current_time
            }

        # Check if it's a new day
        is_new_day = (current_time - prev_data["lastResetTime"]) >= 86400
        new_energy = data.get("energyLeft")
        
        if is_new_day:
            # Reset energy to max on new day
            new_energy = new_level * 1000
            prev_data["lastResetTime"] = current_time

        # Validate score progression
        if not validate_score_progression(
            prev_data["score"], new_score,
            prev_data["level"], new_level,
            prev_data["earnPerTap"], new_earn_per_tap,
            prev_data["levelUpThreshold"], new_level_up_threshold,
            prev_data["energyLeft"], new_energy,
            prev_data["maxEnergy"], new_level * 1000,
            prev_data["lastResetTime"], current_time
        ):
            return web.Response(status=400, text="Invalid score progression")

        # Encrypt and save valid data
        encrypted_data = secure_app.encrypt_data({
            "score": new_score,
            "level": new_level,
            "earnPerTap": new_earn_per_tap,
            "levelUpThreshold": new_level_up_threshold,
            "energyLeft": new_energy,
            "maxEnergy": new_level * 1000,
            "lastResetTime": prev_data["lastResetTime"]
        })
        
        scores[user_id] = encrypted_data
        save_scores(scores)
        
        return web.Response(text="Score updated")
        
    except json.JSONDecodeError:
        return web.Response(status=400, text="Invalid JSON")
    except Exception as e:
        logging.error(f"Error updating score: {e}")
        return web.Response(status=500, text="Internal server error")

def validate_score_progression(
    prev_score: int, new_score: int,
    prev_level: int, new_level: int,
    prev_earn: int, new_earn: int,
    prev_threshold: int, new_threshold: int,
    prev_energy: int, new_energy: int,
    prev_max_energy: int, new_max_energy: int,
    last_reset_time: float, current_time: float
) -> bool:
    """Validate that score progression follows game rules"""
    
    # Check if it's a new day (86400 seconds = 24 hours)
    is_new_day = (current_time - last_reset_time) >= 86400
    
    # Energy validation
    if is_new_day:
        # On a new day, energy should be set to level * 1000
        if new_energy != new_level * 1000:
            return False
    else:
        # During same day, energy can only decrease
        if new_energy > prev_energy:
            return False
    
    # Score should never decrease
    if new_score < prev_score:
        return False
        
    # Maximum possible score increase per request (assuming max 10 fingers * 2 seconds)
    max_possible_increase = prev_earn * 20
    if new_score - prev_score > max_possible_increase:
        return False
        
    # Level progression validation
    if new_level > prev_level:
        if new_level != prev_level + 1:  # Can only increase by 1
            return False
        if new_earn != new_level:  # Earn should match level
            return False
        if new_threshold != prev_threshold * 10:  # Threshold should multiply by 10
            return False
            
    return True

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
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()
    dp["base_url"] = os.getenv("WEB_APP_URL")
    
    # Initialize secure web app
    secure_app = SecureWebApp(TOKEN)
    
    app = Application(middlewares=[rate_limit_middleware, security_middleware])
    app["bot"] = bot
    app["secure"] = secure_app
    
    dp.startup.register(on_startup)
    dp.include_router(router)

    app.router.add_static("/static/", path=get_path_static())

    app.router.add_get("/index", index_handler)
    
    app.router.add_post("/update_score", update_score)  
    app.router.add_get("/get_score", get_score)
    
    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path="/webhook")

    setup_application(app, dp, bot=bot)
    
    # Use a dynamic port if provided by the host environment (e.g., amvera cloud)
    port = int(os.environ.get("PORT", 80))
    run_app(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    main()
