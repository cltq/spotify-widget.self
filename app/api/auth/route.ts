export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId) {
    return Response.json(
      {
        error:
          "SPOTIFY_CLIENT_ID not configured. Create .env.local from .env.example",
      },
      { status: 503 }
    );
  }

  const scope =
    "user-read-currently-playing user-read-playback-state";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri ?? "http://localhost:3000/api/auth/callback",
  });

  return Response.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
