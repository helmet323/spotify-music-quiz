import { getSpotifyAuthUrl } from "../../../lib/spotify";
import { successResponse, errorResponse } from "../../../lib/commons";

export async function GET() {
  try {
    const authUrl = getSpotifyAuthUrl();
    return successResponse({ authUrl });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
