from collections import defaultdict
import time
from aiohttp import web
from aiohttp.web import middleware
from typing import Callable
from aiohttp.web_request import Request
from aiohttp.web_response import Response
import os
from os import getenv

rate_limits = defaultdict(lambda: {"count": 0, "reset_time": time.time()})
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS = 100      # max requests per minute

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN")
if not TOKEN:
    raise ValueError("Telegram bot token is not set (check TELEGRAM_BOT_TOKEN or BOT_TOKEN)!")

@middleware
async def rate_limit_middleware(request: Request, handler: Callable) -> Response:
    client_ip = request.remote
    current_time = time.time()
    
    # Reset counter if window has passed
    if current_time - rate_limits[client_ip]["reset_time"] >= RATE_LIMIT_WINDOW:
        rate_limits[client_ip] = {"count": 0, "reset_time": current_time}
    
    rate_limits[client_ip]["count"] += 1
    
    if rate_limits[client_ip]["count"] > MAX_REQUESTS:
        return web.Response(status=429, text="Too many requests")
    
    return await handler(request)

@middleware
async def security_middleware(request: Request, handler: Callable) -> Response:
    response = await handler(request)
    
    # Security Headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self' https://telegram.org https://*.telegram.org https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' https://telegram.org https://*.telegram.org;"
    
    return response 