import logging
import random

from app.models.difficulty_model import Difficulty
from app.schema.retrieved_question_schema import RetrievedQuestionSchema
from app.services.supabase_service import SupabaseService

LOGGER = logging.getLogger(__name__)


class QuestionRepositoryRetriever(SupabaseService):
    # --------------------------------------------------------------
    # Fetch questions
    # --------------------------------------------------------------
    def _fetch_questions(self, diff_values: list[str]):
        res = (
            self._client.from_("questions")
            .select("id, title, difficulty, link")
            .in_("difficulty", diff_values)
            .execute()
        )
        return res.data or []

    # --------------------------------------------------------------
    # Grouping
    # --------------------------------------------------------------
    def _group_by_difficulty(self, rows):
        grouped: dict[str, list[dict]] = {}
        for r in rows:
            grouped.setdefault(r["difficulty"], []).append(r)
        return grouped

    # --------------------------------------------------------------
    # Pick unique questions (order preserved)
    # --------------------------------------------------------------
    def _pick_unique(self, diff_values, grouped):
        used = set()
        selected = []

        for diff in diff_values:
            options = [q for q in grouped.get(diff, []) if q["id"] not in used]
            if not options:
                raise ValueError("Not enough unique questions for difficulty")
            chosen = options[0]
            used.add(chosen["id"])
            selected.append(chosen)

        return selected

    # --------------------------------------------------------------
    # Fetch company / topic maps
    # --------------------------------------------------------------
    def _fetch_company_map(self, q_ids):
        res = (
            self._client.from_("question_companies")
            .select("question_id, companies(name)")
            .in_("question_id", q_ids)
            .execute()
        )
        return self._parse_name_map(res.data or [], "companies")

    def _fetch_topic_map(self, q_ids):
        res = (
            self._client.from_("question_topic")
            .select("question_id, topics(name)")
            .in_("question_id", q_ids)
            .execute()
        )
        return self._parse_name_map(res.data or [], "topics")

    # --------------------------------------------------------------
    # Normalized name extraction (low complexity)
    # --------------------------------------------------------------
    def _parse_name_map(self, rows, key):
        out = {}
        for row in rows:
            qid = row["question_id"]
            raw = row.get(key)
            out.setdefault(qid, [])

            names = self._normalize_names(raw)
            if names:
                out[qid].extend(names)

        return out

    def _normalize_names(self, raw):
        if not raw:
            return []

        # Case: single dict
        if isinstance(raw, dict):
            name = raw.get("name")
            return [name] if name else []

        # Case: list
        if isinstance(raw, list):
            out = []
            for item in raw:
                if isinstance(item, dict):
                    name = item.get("name")
                    if name:
                        out.append(name)
                elif isinstance(item, str):
                    out.append(item)
            return out

        # Case: string
        if isinstance(raw, str):
            return [raw]

        return []

    # --------------------------------------------------------------
    # Final response builder
    # --------------------------------------------------------------
    def _build_response(self, selected, company_map, topic_map):
        result: list[RetrievedQuestionSchema] = []
        for q in selected:
            qid = q["id"]
            result.append(
                RetrievedQuestionSchema(
                    name=q["title"],
                    company=company_map.get(qid, []),
                    difficulty=Difficulty(q["difficulty"]),
                    link=q["link"],
                    tag=topic_map.get(qid, []),
                ),
            )
        return result

    # --------------------------------------------------------------
    # Public method
    # --------------------------------------------------------------
    def get_random_questions(
        self,
        difficulty: list[Difficulty],
    ) -> list[RetrievedQuestionSchema]:
        diff_values = [d.value for d in difficulty]

        rows = self._fetch_questions(diff_values)
        random.shuffle(rows)

        grouped = self._group_by_difficulty(rows)
        selected = self._pick_unique(diff_values, grouped)

        q_ids = [q["id"] for q in selected]

        company_map = self._fetch_company_map(q_ids)
        topic_map = self._fetch_topic_map(q_ids)

        return self._build_response(selected, company_map, topic_map)
