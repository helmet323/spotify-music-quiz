import { getSpotifyAccessToken } from "../../../lib/spotify";
import { parse } from "cookie";
import { errorResponse } from "../../../lib/commons";

export async function GET(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const spotify_id = cookies.spotify_user;

    if (!spotify_id) return errorResponse("Not logged in", 401);

    const token = await getSpotifyAccessToken(spotify_id);

    const res = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=10",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return errorResponse("Failed to fetch playlists", res.status);

    const data = await res.json();

    const playlists = data.items.map((pl) => ({
      id: pl.id,
      name: pl.name,
      image: pl.images?.[0]?.url ?? null,
      tracks: pl.tracks.total,
      externalUrl: pl.external_urls.spotify,
    }));

    return new Response(JSON.stringify({ success: true, playlists }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err.message || "Internal server error", 500);
  }
}
