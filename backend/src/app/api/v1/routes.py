from fastapi import APIRouter

from app.schema.progress_data_scheme import ProgressDataSchema
from app.services.progress_service import ProgressService
from app.services.question_service import QuestionService

progress_service = ProgressService()
question_service = QuestionService()

router = APIRouter()


@router.get("/questions")
def get_questions():
    return question_service.get_all_questions()


@router.get("/questions/{question_id}")
def get_question(question_id: str):
    return question_service.get_question_by_id(question_id)


@router.post("/progress")
def save_progress(payload: ProgressDataSchema):
    return progress_service.save_progress(payload)
