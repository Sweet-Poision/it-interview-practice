from enum import Enum


class Difficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

    @property
    def cost(self) -> int:
        mapping = {
            "EASY": 20,
            "MEDIUM": 40,
            "HARD": 60,
        }
        return mapping[self]

    # Enables sorting by cost (EASY < MEDIUM < HARD) instead of Alphabetical (EASY < HARD < MEDIUM)
    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self.cost < other.cost
        return NotImplemented
