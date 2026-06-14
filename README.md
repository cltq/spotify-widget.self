# Spotify Widget

> **Vibe coded by AI** — this project was built entirely through natural language conversations with an AI coding agent.

An OBS-ready widget that displays your currently playing Spotify track. Uses the Spotify Web API to fetch your real-time listening status and renders a clean, transparent overlay perfect for streaming.

## Features

- Shows album art, track name, and artist
- Auto-refreshes every 5 seconds
- Transparent background for OBS overlay
- Only detects **your** account (uses OAuth refresh token)

## Setup

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add a redirect URI (e.g. `http://localhost:3000/api/auth/callback` or your Vercel domain)
3. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
4. Visit `/api/auth` to authorize → copy the displayed refresh token into `.env.local` as `SPOTIFY_REFRESH_TOKEN`

## OBS Integration

Add a **Browser Source** in OBS with:
- URL: `http://localhost:3000/widget`
- Width: 400, Height: 100
- Enable "Refresh browser when scene becomes active"

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
