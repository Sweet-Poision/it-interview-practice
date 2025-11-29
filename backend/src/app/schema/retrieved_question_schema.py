from pydantic import BaseModel

from app.models.difficulty_model import Difficulty
from app.schema.difficulty_data_schema import DifficultyDataSchema


class RetrievedQuestionSchema(BaseModel):
    name: str
    company: list[str]
    difficulty: Difficulty
    link: str
    tag: list[str]


class RetrievedQuestionsSchema(BaseModel):
    payload_data : list[RetrievedQuestionSchema]
    payload_meta : DifficultyDataSchema
