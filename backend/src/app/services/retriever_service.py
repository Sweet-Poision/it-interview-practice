from typing import TYPE_CHECKING

from app.db.retriever import QuestionRepositoryRetriever
from app.schema.retrieved_question_schema import (
    RetrievedQuestionSchema,
    RetrievedQuestionsSchema,
)
from app.services.plan_service import PlanService

if TYPE_CHECKING:
    from app.schema.difficulty_data_schema import (
        Difficulty,
        DifficultyDataSchema,
    )

import logging

LOGGER = logging.getLogger(__name__)


class RetrieverService:
    def __init__(self, plan_service: PlanService):
        try:
            self._difficulty_data: DifficultyDataSchema = plan_service.plan()
            LOGGER.info("Planning done for frontend data.")

        except ValueError:
            LOGGER.warning("Could not plan the difficulty.")

        self._difficulty_required: list[Difficulty] = self._difficulty_data.difficulty_data

    def retrieve(
        self,
        db_service: QuestionRepositoryRetriever,
    ) -> RetrievedQuestionsSchema:
        retrieved_data: list[RetrievedQuestionSchema] = db_service.get_random_questions(self._difficulty_required)
        result_data = RetrievedQuestionsSchema(
            payload_data=retrieved_data,
            payload_meta=self._difficulty_data,
        )

        return result_data
