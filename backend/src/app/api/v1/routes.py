from fastapi import APIRouter

from app.config.supabase import supabase

router = APIRouter()


@router.get("/questions")
def get_questions():
    data = supabase.table("questions").select("*").execute()
    return data.data


@router.get("/questions/{question_id}")
def get_question(question_id: str):
    data = supabase.table("questions").select("*").eq("id", question_id).single().execute()
    return data.data


@router.post("/progress")
def save_progress(payload: dict):
    data = supabase.table("progress").insert(payload).execute()
    return data.data

@router.get("/test")
def test():
    return supabase.table("questions") \
        .select("*") \
        .order("title", desc=False) \
        .limit(1) \
        .execute()
