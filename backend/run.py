"""Development entrypoint: reads API_HOST/API_PORT from settings (.env).

Run from the backend/ directory:
    python run.py            # single worker
    python run.py --reload   # auto-reload on code changes
"""

import uvicorn

from app.core.config import get_settings


def main() -> None:
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload="--reload" in __import__("sys").argv,
    )


if __name__ == "__main__":
    main()
