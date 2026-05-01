# ClassReconnect Conversations Backend

Simple Express API with JSON file storage for Q&A conversations.

## Endpoints

- GET `/api/health`
- GET `/api/conversations?userId=...`
- POST `/api/conversations`
- PUT `/api/conversations/:id`
- DELETE `/api/conversations/:id?userId=...`
- POST `/api/qa/answer` (body: `{ question: string }`) returns `{ success, answer }`

## Run (Windows PowerShell)

```powershell
cd "c:\Users\Karan Vora\Desktop\Mini Project\backend"
npm install
# set your OpenAI key in the environment for this session
$env:OPENAI_API_KEY="sk-your-key"
npm run start
```

Server runs at `http://localhost:3000`.

Data is stored in `backend/data/db.json`.

## AI-only mode

To force answers to come exclusively from the AI (and disable local rule-based fallback), set the environment variable:

```powershell
$env:QA_REQUIRE_AI="true"
```

When enabled, if the AI is not configured or temporarily unavailable, the endpoint will return `503` with `{ success: false, error: 'AI service unavailable...' }`.

Required variables for AI:

- `OPENAI_API_KEY` — your OpenAI API key
- `OPENAI_MODEL` — model name (e.g., `gpt-3.5-turbo`)


