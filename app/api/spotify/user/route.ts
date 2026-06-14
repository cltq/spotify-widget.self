const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const USER_ENDPOINT = "https://api.spotify.com/v1/me";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  return data.access_token as string;
}

export async function GET() {
  try {
    if (
      !process.env.SPOTIFY_CLIENT_ID ||
      !process.env.SPOTIFY_CLIENT_SECRET ||
      !process.env.SPOTIFY_REFRESH_TOKEN
    ) {
      return Response.json(
        { error: "Spotify credentials not configured" },
        { status: 503 }
      );
    }

    const accessToken = await getAccessToken();

    const res = await fetch(USER_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    const data = await res.json();

    return Response.json({
      displayName: data.display_name,
      avatarUrl: data.images?.[0]?.url,
      product: data.product,
      id: data.id,
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Spotify user API error:", error);
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
