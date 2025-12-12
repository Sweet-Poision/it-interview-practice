# IT Interview Practice

A comprehensive platform designed to help candidates prepare for IT interviews. This application provides a structured environment to practice technical questions, manage sessions, and track progress with difficulty levels and timing constraints.

## Features

- **Practice Sessions**: Interactive coding or theory question sessions.
- **Difficulty Selection**: Filter questions by difficulty (Easy, Medium, Hard).
- **Session Management**: Timer-based sessions to simulate real interview pressure.
- **Privacy Focused**: detailed privacy policy and secure data handling.
- **Modern UI**: Clean, responsive interface built with React 19.

## Tech Stack

### Backend
- **Language**: Python 3.13+
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework for APIs.
- **Database**: [Supabase](https://supabase.com/) - Open source Firebase alternative (PostgreSQL).
- **Package Manager**: [uv](https://github.com/astral-sh/uv) - An extremely fast Python package installer and resolver.
- **Testing**: `pytest`
- **Linting/Formatting**: `ruff`, `black`, `mypy`

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Styling**: Modern CSS3 (modules/variable-based)

## Project Structure

```bash
.
├── backend/            # FastAPI backend application
│   ├── src/            # Source code (API, models, services)
│   ├── pyproject.toml  # Python dependencies and config
│   └── uv.lock         # Locked dependencies
├── frontend/           # React frontend application
│   ├── src/            # Source code (Components, Pages, Hooks)
│   └── package.json    # Node dependencies
└── docker/             # Container configuration (if applicable)
```

## Getting Started

### Prerequisites

- **Python** (version 3.13 or higher)
- **Node.js** (LTS version recommended)
- **uv** (for backend dependency management)
- **npm** or **pnpm** (for frontend)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment and install dependencies:**
   Using `uv` (recommended):
   ```bash
   uv sync
   ```
   *Alternatively, if not using `uv`, create a venv and install from `pyproject.toml` manually.*

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend` directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials (`SUPABASE_URL`, etc.) and other required variables.

4. **Run the Server:**
   ```bash
   uv run uvicorn src.app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file (if required) or check for defaults. Ensure it points to your running backend (usually proxy or VITE_API_URL).

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
