from pydantic import BaseModel


class Difficulty(BaseModel):
    EASY : int = 20
    MEDIUM : int = 40
    HARD : int = 60
