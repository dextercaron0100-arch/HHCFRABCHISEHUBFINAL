# Live Chat System - AI Bot + Live Agent Backend

## Files
- `server.js` - Node.js/Express/Socket.IO backend
- `widget.html` - Visitor-facing embeddable chat widget
- `agent-dashboard.html` - Agent dashboard
- `.env.example` - Environment variable template
- `railway.toml` - Railway deploy config for this service

## Setup

```bash
npm install
cp .env.example .env
node server.js
```

Set these values in `.env` before production use:
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `ANTHROPIC_API_KEY` if you want AI replies
- `BUSINESS_CONTEXT`

## Railway Deploy

This folder can be deployed as its own Railway service.

1. Create a Railway service from this repository.
2. Set `Root Directory` to `/Live chat system`.
3. Set the Railway config file path to `/Live chat system/railway.toml`.
4. Add the required environment variables from `.env.example`.
5. Generate a public Railway domain.
6. Test these routes:
   - `/health`
   - `/widget`
   - `/agent-dashboard`

The included `railway.toml` sets:
- `startCommand = "npm start"`
- `healthcheckPath = "/health"`
- `watchPatterns = ["/Live chat system/**"]`

For production, include both your website domain and your Railway chat domain in `ALLOWED_ORIGINS`.

## Website Connection

After Railway gives you a public URL, set this in your Vercel project:

- `HHF_LIVE_CHAT_URL=https://your-chat-service.up.railway.app`

Then redeploy the website so the live chat loader can use the Railway chat server.

## Agent Dashboard

Default credentials in `server.js`:
- `admin / admin123`
- `agent1 / agent123`

Change these before production.

## REST API
- `GET /health`
- `POST /api/agent/login`
- `GET /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/close`
- `GET /api/stats`

## Production Checklist
- Change `JWT_SECRET`.
- Replace the hardcoded agent credentials.
- Set real `ALLOWED_ORIGINS` values.
- Add persistent storage if you need saved chat history.
- Add Redis if you need multi-instance session state.