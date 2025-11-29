from pydantic import BaseModel

from app.models.difficulty_model import Difficulty


class PlanRequestSchema(BaseModel):
    time : int
    tags : list[Difficulty]
