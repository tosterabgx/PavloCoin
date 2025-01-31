from pathlib import Path

from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request

def get_path_static():
    return Path(__file__).parent.resolve() / "website" / "static"

async def index_handler(request: Request):
    return FileResponse(Path(__file__).parent.resolve() / "website" / "index.html")

