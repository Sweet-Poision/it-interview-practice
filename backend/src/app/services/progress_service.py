from app.schema.progress_data_scheme import ProgressDataSchema
from app.services.supabase_service import SupabaseService


class ProgressService(SupabaseService):

    def save_progress(self, progress_data : ProgressDataSchema):
        payload = progress_data.model_dump(mode="json")
        result = self._client\
            .table("progress")\
            .insert(payload)\
            .execute()
        return result.data

