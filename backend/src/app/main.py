from fastapi import FastAPI

from app.api.v1.routes import router
from app.core.logger import setup_logging

setup_logging()

app = FastAPI()
app.include_router(router)
