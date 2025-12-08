import logging

from fastapi import APIRouter

from app.db.retriever import QuestionRepositoryRetriever
from app.schema.plan_request_schema import PlanRequestSchema
from app.schema.progress_data_scheme import ProgressDataSchema
from app.services.plan_service import PlanService
from app.services.progress_service import ProgressService
from app.services.question_service import QuestionService
from app.services.retriever_service import RetrieverService

LOGGER = logging.getLogger(__name__)

progress_service = ProgressService()
question_service = QuestionService()

router = APIRouter()


@router.get("/questions", tags=["Debug"])
def get_questions():
    return question_service.get_all_questions()


@router.post("/plan", tags=["Planner"])
def plan_questions(time_and_difficulty: PlanRequestSchema):
    plan_service = PlanService(time_and_difficulty)
    retriever_service = RetrieverService(plan_service)
    db_retriever = QuestionRepositoryRetriever()
    return retriever_service.retrieve(db_retriever)


@router.get("/questions/{question_id}", tags=["Debug"])
def get_question(question_id: str):
    return question_service.get_question_by_id(question_id)


@router.post("/progress", tags=["Progess"])
def save_progress(payload: ProgressDataSchema):
    return progress_service.save_progress(payload)
