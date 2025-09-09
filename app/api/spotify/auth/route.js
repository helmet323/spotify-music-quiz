export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scopes = ["user-read-email", "user-read-private"].join(" ");

  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({ error: "Missing Spotify env variables" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return new Response(JSON.stringify({ authUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
