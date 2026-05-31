# WanderLog

A React + Vite single-page app for exploring countries, authenticating with Reqres.in, and saving a travel bucket list.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

## Test credentials

- Email: `eve.holt@reqres.in`
- Password: any password

## Optional API key support

Reqres now requires an `x-api-key` header for classic auth endpoints. If you want to use a real Reqres API key, create a `.env` file with:

```env
VITE_REQRES_API_KEY=your_reqres_api_key
```

Without a key, the app still supports a local demo fallback for the provided test email.

## What I would improve with more time

- Add a saved destinations sidebar so users can manage wish list and visited countries without leaving the explore screen.
- Show country detail by name in the border list and cache country data to avoid repeated fetches.
- Add a dark mode toggle persisted in localStorage.
