# AI Website Builder

A mini React frontend assignment that includes:

- Login and signup UI
- Token storage in `localStorage`
- Protected routes
- AI website generation form
- Save + CRUD flows for generated websites
- Pagination
- Inline validation
- API-ready service layer with a mock fallback

## Run locally

```bash
npm install
npm run dev
```

## Mock vs backend

The app uses a mock API by default so the full assignment works without a backend.

Create a `.env.local` file to point it at Laravel:

```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Expected endpoints:

- `POST /api/signup`
- `POST /api/login`
- `GET /api/me`
- `POST /api/websites/generate`
- `POST /api/websites`
- `GET /api/websites?page=1&page_size=4`
- `GET /api/websites/:id`
- `PUT /api/websites/:id`
- `DELETE /api/websites/:id`
