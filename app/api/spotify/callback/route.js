import {
  exchangeCodeForToken,
  fetchSpotifyUser,
  upsertSpotifyUser,
  createSessionCookie,
} from "../../../lib/spotify";
import { errorResponse } from "../../../lib/commons";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) return errorResponse("No code provided", 400);

    const tokens = await exchangeCodeForToken(code);
    const userData = await fetchSpotifyUser(tokens.access_token);
    const spotifyId = await upsertSpotifyUser(userData, tokens);
    const cookie = createSessionCookie(spotifyId);

    // Redirect to menu page with cookie set
    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": cookie,
        Location: "/menu",
      },
    });
  } catch (err) {
    return errorResponse(err.message, 400);
  }
}
