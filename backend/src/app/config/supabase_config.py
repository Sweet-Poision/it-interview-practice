import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # use service key for inserts
if SUPABASE_KEY and SUPABASE_URL:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    raise KeyError("Couldn't find the Key for Database Connection")
