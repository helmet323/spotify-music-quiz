// app/api/spotify/access-token/route.js
import { NextResponse } from "next/server";
import { parse } from "cookie";
import { getSpotifyAccessToken } from "../../../lib/spotify";
import { errorResponse } from "../../../lib/commons";

export async function GET(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const spotify_id = cookies.spotify_user;
    if (!spotify_id) return errorResponse("Not logged in", 401);

    const token = await getSpotifyAccessToken(spotify_id);

    return NextResponse.json({ success: true, accessToken: token });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
