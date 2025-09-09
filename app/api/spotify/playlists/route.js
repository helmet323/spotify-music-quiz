import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Fetch first user from database (replace with session logic later)
    const users = await sql`SELECT * FROM spotify_users LIMIT 1`;
    if (!users.length) {
      return new Response(
        JSON.stringify({ success: false, error: "No user found" }),
        { status: 404 }
      );
    }

    const { access_token } = users[0];

    // Fetch user's playlists from Spotify
    const res = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=10",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await res.json();

    // Map only necessary info for the frontend
    const playlists = data.items.map((pl) => ({
      id: pl.id,
      name: pl.name,
      total_tracks: pl.tracks.total,
    }));

    return new Response(JSON.stringify({ success: true, playlists }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
