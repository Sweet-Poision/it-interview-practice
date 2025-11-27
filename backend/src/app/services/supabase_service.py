from app.config.supabase_config import supabase


class SupabaseService:
    def __init__(self):
        self._client = supabase
