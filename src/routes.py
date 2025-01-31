from pathlib import Path

from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request

async def index_handler(request: Request):
    return FileResponse(Path(__file__) / "website" / "index.html")

