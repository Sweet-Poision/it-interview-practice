from pydantic import BaseModel

from app.models.difficulty_model import Difficulty


class DifficultyDataSchema(BaseModel):
    difficulty_data: list[Difficulty]
    time_utilised: int
    time_wasted: int
