import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

# logs folder always relative to project root
PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOG_DIR = PROJECT_ROOT / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOG_DIR / "app.log"

def setup_logging():
    # Avoid duplicate handlers if setup_logging is called multiple times
    if logging.getLogger().handlers:
        return

    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # File handler (rotating)
    file_handler = RotatingFileHandler(
        LOG_FILE,
        maxBytes=5_000_000,
        backupCount=5,
    )
    file_handler.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # Formatter: timestamp | level | logger_name | message
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        "%Y-%m-%d %H:%M:%S",
    )

    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Attach handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
