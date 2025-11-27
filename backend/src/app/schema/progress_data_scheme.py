from pydantic import BaseModel


class ProgressDataSchema(BaseModel):
    user_id: str
    question_id: str
    status: str
    time_taken: int
