import logging

from fastapi import APIRouter

from app.schema.plan_request_schema import PlanRequestSchema
from app.schema.progress_data_scheme import ProgressDataSchema
from app.services.plan_service import PlanService
from app.services.progress_service import ProgressService
from app.services.question_service import QuestionService

LOGGER = logging.getLogger(__name__)

progress_service = ProgressService()
question_service = QuestionService()

router = APIRouter()

@router.get("/questions")
def get_questions():
    return question_service.get_all_questions()


@router.get("/plan")
def plan_questions(time_and_difficulty: PlanRequestSchema):
    plan_service = PlanService(time_and_difficulty)
    return plan_service.plan()


@router.get("/questions/{question_id}")
def get_question(question_id: str):

    return question_service.get_question_by_id(question_id)


@router.post("/progress")
def save_progress(payload: ProgressDataSchema):
    return progress_service.save_progress(payload)
