import { NextResponse } from "next/server";
import { parse } from "cookie";
import { getSpotifyAccessToken } from "../../../../lib/spotify";
import { errorResponse } from "../../../../lib/commons";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    console.log("📥 Incoming request for playlist tracks", { id });

    if (!id) {
      console.error("❌ Missing playlist ID");
      return errorResponse("Playlist ID is required", 400);
    }

    // Get Spotify user ID from cookie
    const cookies = parse(req.headers.get("cookie") || "");
    const spotify_id = cookies.spotify_user;

    if (!spotify_id) {
      console.error("❌ Not logged in");
      return errorResponse("Not logged in", 401);
    }

    // Get valid access token
    const token = await getSpotifyAccessToken(spotify_id);

    // Fetch playlist tracks from Spotify
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("❌ Failed to fetch tracks", errData);
      return errorResponse(
        `Failed to fetch tracks: ${errData.error?.message || "Unknown error"}`,
        res.status
      );
    }

    const data = await res.json();

    // Map simplified track info
    const tracks = data.items
      .map((item) => item.track)
      .filter(Boolean) // remove nulls (removed tracks)
      .map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        image: track.album.images?.[0]?.url ?? null,
        uri: track.uri, // Spotify URI needed for playback
      }));

    console.log(`✅ Fetched ${tracks.length} tracks for playlist ${id}`);

    return NextResponse.json({ success: true, tracks });
  } catch (err) {
    console.error("❌ Error fetching playlist tracks:", err);
    return errorResponse(err.message, 500);
  }
}
