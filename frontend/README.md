# IT Interview Practice - Frontend

This directory contains the React frontend for the IT Interview Practice platform. Built with Vite, it provides a responsive and interactive user interface for practicing interview questions.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: JavaScript (ESModules)
- **Routing**: React Router DOM v7
- **Styling**: CSS Modules / Standard CSS
- **Icons**: Lucide React

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm (or pnpm/yarn)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in this directory if you need to override default API endpoints (though mostly handled via proxy in `vite.config.js` or `VITE_` variables).

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Structure

- `src/main.jsx`: Application entry point.
- `src/App.jsx`: Main application component and routing setup.
- `src/pages/`: Page components (Home, Session, etc.).
- `src/components/`: Reusable UI components (StartButton, DifficultySelector, etc.).
- `src/assets/`: Static assets like images and global styles.

## Proxy

The development server is configured to proxy API requests to the backend. Ensure your backend is running on default port `8000` or update `vite.config.js` accordingly (if proxy is configured there).
