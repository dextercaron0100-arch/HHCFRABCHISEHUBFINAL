# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Inquiry Form Deploy Notes (Vercel + Railway)

This project includes a Vercel serverless endpoint at `/api/inquiry` (`api/inquiry.js`) that proxies form submissions to your backend.

Set this env var in Vercel Project Settings:

- `INQUIRY_BACKEND_URL=https://<your-railway-backend-domain>`

Example:

- `INQUIRY_BACKEND_URL=https://your-backend.up.railway.app`

The frontend forms can keep using `/api/inquiry` in production and development.

## Live Chat Deploy Notes (Vercel + Chat Backend)

Set this env var in Vercel Project Settings:

- `HHF_LIVE_CHAT_URL=https://<your-chat-server-domain>`

Example:

- `HHF_LIVE_CHAT_URL=https://your-chat-server.up.railway.app`

The website will read `/api/chat-config` at runtime and use that URL for the live chat widget. Your chat server must also allow your website domain in `ALLOWED_ORIGINS`.