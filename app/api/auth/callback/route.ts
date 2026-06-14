const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new Response(
      `<html><body><h1>Authorization denied</h1><p>Error: ${error}</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new Response(
      `<html><body><h1>Missing authorization code</h1></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!data.refresh_token) {
    return new Response(
      `<html>
        <head><meta charset="utf-8"></head>
        <body>
          <h1>Error getting token</h1>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new Response(
    `<html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:system-ui;padding:2rem;max-width:640px">
        <h1>Spotify Widget — Setup Complete</h1>
        <p>Copy this refresh token into your <code>.env.local</code> file:</p>
        <pre style="background:#f4f4f4;padding:1rem;border-radius:8px;overflow-x:auto;word-break:break-all;font-size:0.9rem">
SPOTIFY_REFRESH_TOKEN=${data.refresh_token}
        </pre>
        <p>Then restart your dev server and visit <a href="/widget">/widget</a> to see your Spotify status.</p>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
