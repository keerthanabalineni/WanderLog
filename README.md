# WanderLog

A React + Vite single-page app that uses Reqres.in for mock authentication and the REST Countries API for live country data.

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

> If Reqres returns a missing API key error, the app falls back to a local demo login for the test user.

## Features implemented

- Authentication with sign in / sign up support
- Protected routes for explore and country detail screens
- Session persistence with localStorage
- REST Countries API fetching with loading and error states
- Country detail screen with neighbor links
- Per-user bucket list and visited state
- Responsive layout for desktop and mobile screens

## What I would improve with more time

- Add a saved destinations sidebar for quick list management.
- Cache fetched country details to reduce repeat network requests.
- Add dark mode and more accessible keyboard focus styles.
