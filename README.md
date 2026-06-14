# Spotify Widget

> **Vibe coded by AI** — this project was built entirely through natural language conversations with an AI coding agent.

An OBS-ready widget that displays your currently playing Spotify track. Uses the Spotify Web API to fetch your real-time listening status and renders a clean overlay perfect for streaming.

> This project is designed for **personal use only** — it uses a single Spotify refresh token tied to your account. Feel free to [fork it](https://github.com/cltq/spotify-widget.self) and make it your own.

## Features

- Shows album art, track name, artist
- Live progress bar (current position / duration)
- Paused / playing state indicator
- Auto-refreshes every 5 seconds
- Transparent background by default (OBS-ready)
- Customizable via URL query parameters
- Only detects **your** account (uses OAuth refresh token)

## Setup

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add `http://localhost:3000/api/auth/callback` (and/or your Vercel URL) as a Redirect URI
3. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REDIRECT_URI`
4. Visit `/api/auth` to authorize → copy the displayed refresh token into `.env.local` as `SPOTIFY_REFRESH_TOKEN`

## OBS Integration

Add a **Browser Source** in OBS with:
- URL: `http://localhost:3000/widget` (or your Vercel URL)
- Width: 400, Height: 120
- Enable "Refresh browser when scene becomes active"

## Widget Customization

Append URL query parameters to `/widget` to customize the appearance:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `bg` | transparent | Background color (any CSS color or `transparent`) |
| `color` | #ffffff | Text color |
| `font` | system-ui | Font family |
| `progress` | bar | Show progress bar: `bar`, `none` |
| `size` | md | Text size: `sm`, `md`, `lg` |

### Examples

```
/widget?bg=#000000&color=#1db954
/widget?bg=rgba(0,0,0,0.5)&font=monospace
/widget?progress=none
/widget?size=lg&bg=#1a1a2e&color=#e94560
```

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
