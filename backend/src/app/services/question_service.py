from app.services.supabase_service import SupabaseService


class QuestionService(SupabaseService):
    def get_all_questions(self):
        data = self._client.table("questions") \
        .select("*") \
        .execute()

        data = data.data
        return data

    def get_question_by_id(self, question_id: str):
        data = self._client.table("questions") \
        .select("*") \
        .eq("id", question_id) \
        .single().execute()

        data = data.data
        return data
