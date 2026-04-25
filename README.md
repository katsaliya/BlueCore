# BlueCore

## Frontend + backend integration

- Backend: set `services/backend-ts/.env` with `HOST`, `PORT`, and `CORS_ORIGIN` (frontend origin).
- Frontend: copy `frontend/.env.example` to `frontend/.env` if you need to override `VITE_API_BASE_URL`.
- Run backend: `cd services/backend-ts && npm run dev`.
- Run frontend: `cd frontend && npm run dev`.
