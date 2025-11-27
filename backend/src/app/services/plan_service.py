from typing import TYPE_CHECKING

from app.schema.plan_request_schema import PlanRequestSchema

if TYPE_CHECKING:
    from app.models.difficulty_model import Difficulty


class PlanService:
    def __init__(self, payload: PlanRequestSchema):
        self._time : int = payload.time
        self._tags : list[Difficulty] = payload.tags

    def plan(self):
        """
        Makes a plan according to time and difficulty.

        Assumption is -
        Hard question takes 60 minutes,
        Medium question takes 40 minutes,
        Easy question takes 20 minutes
        """
        return None
