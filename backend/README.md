# IT Interview Practice - Backend

This directory contains the FastAPI-based backend service for the IT Interview Practice platform. It manages user sessions, questions, and interview logic, utilizing Supabase for data persistence.

## Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Runtime**: Python 3.13+
- **Database**: PostgreSQL (via Supabase)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **Testing**: Pytest
- **Linting**: Ruff, Black, MyPy

## Development Setup

### Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) installed
- Supabase project credentials

### Installation

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your Supabase URL and Key:
   ```env
   SUPABASE_URL="your-supabase-url"
   SUPABASE_KEY="your-supabase-anon-key"
   ```

### Running the Service

Start the development server with hot reload:

```bash
uv run uvicorn src.app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, visit:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Testing

Run the test suite using `pytest`:

```bash
uv run pytest
```

## Structure

- `src/app/main.py`: Entry point of the application.
- `src/app/api/`: API route handlers.
- `src/app/core/`: Core configurations and security settings.
- `src/app/db/`: Database connection and session management.
- `src/app/models/`: SQLModel/SQLAlchemy database models.
- `src/app/schemas/`: Pydantic models for request/response validation.
- `src/app/services/`: Business logic layer.
