import logging

from app.models.difficulty_model import Difficulty
from app.schema.plan_request_schema import PlanRequestSchema

LOGGER = logging.getLogger(__name__)


class PlanService:
    def __init__(self, payload: PlanRequestSchema):
        self._time: int = payload.time
        self._difficulty_tags: list[Difficulty] = payload.tags

    def plan(self) -> tuple[list[Difficulty], int, int]:
        # 1. Calculate the cost of one full cycle
        # changed .value to .cost
        cycle_cost = sum(d.cost for d in self._difficulty_tags)

        if cycle_cost == 0:
            LOGGER.info(
                "Got total duration equal to 0. Cant set a test for 0 time.",
            )
            raise ValueError("The time selected was zero")

        # 2. Calculate how many full cycles fit into the available time
        num_full_cycles = self._time // cycle_cost
        remaining_time = self._time % cycle_cost

        # 3. Create the base list
        final_plan: list[Difficulty] = self._difficulty_tags * num_full_cycles

        if remaining_time == 0:
            return (sorted(final_plan), cycle_cost, 0)

        # 4. Use DP to fill the exact remaining time
        sorted_difficulty_tags = sorted(self._difficulty_tags)

        best_fill_for_remainder = self._check_closest_value_with_max_items(
            sorted_difficulty_tags, remaining_time
        )

        final_plan.extend(best_fill_for_remainder)

        total_time_utilised: int = sum(d.cost for d in final_plan)
        return (
            sorted(final_plan),
            total_time_utilised,
            self._time - total_time_utilised,
        )

    def _check_closest_value_with_max_items(
        self,
        sorted_difficulty_tags: list[Difficulty],
        total_difficulty_time: int,
    ) -> list[Difficulty]:
        dp = {0: []}

        for difficulty_tag in sorted_difficulty_tags:
            existing_sums = list(dp.items())

            for prev_sum, subset in existing_sums:
                # changed difficulty_tag (enum) to difficulty_tag.cost (int) for math
                current_sum = prev_sum + difficulty_tag.cost

                if current_sum <= total_difficulty_time:
                    new_subset = [*subset, difficulty_tag]

                    if current_sum not in dp or len(new_subset) > len(
                        dp[current_sum],
                    ):
                        dp[current_sum] = new_subset

        best_sum = max(dp.keys())
        return dp[best_sum]
