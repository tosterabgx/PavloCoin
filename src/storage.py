import json
from pathlib import Path
from typing import Dict, Any
import fcntl

class SecureStorage:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.file_path.touch(exist_ok=True)

    def load(self) -> Dict[str, Any]:
        with open(self.file_path, 'r') as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_SH)
            try:
                return json.load(f) if self.file_path.stat().st_size > 0 else {}
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

    def save(self, data: Dict[str, Any]) -> None:
        with open(self.file_path, 'w') as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
            try:
                json.dump(data, f, indent=4)
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN) 