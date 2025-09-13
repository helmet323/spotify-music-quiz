import { neon } from "@neondatabase/serverless";
import { serialize } from "cookie";

const sql = neon(process.env.DATABASE_URL);

/**
 * Exchange Spotify authorization code for access & refresh tokens
 */
export async function exchangeCodeForToken(code) {
  if (!code) throw new Error("No code provided");

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get token from Spotify");

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Fetch Spotify user profile using access token
 */
export async function fetchSpotifyUser(accessToken) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!data.id) throw new Error("Failed to fetch Spotify user");

  return {
    spotify_id: data.id,
    display_name: data.display_name,
    email: data.email,
    is_premium: data.product === "premium",
  };
}

/**
 * Upsert Spotify user in the database
 */
export async function upsertSpotifyUser(userData, tokens) {
  const expires_at = new Date(Date.now() + tokens.expires_in * 1000);

  await sql`
    INSERT INTO spotify_users
      (spotify_id, display_name, email, access_token, refresh_token, expires_at, is_premium)
    VALUES
      (${userData.spotify_id}, ${userData.display_name}, ${userData.email}, ${tokens.access_token}, ${tokens.refresh_token}, ${expires_at}, ${userData.is_premium})
    ON CONFLICT (spotify_id)
    DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      is_premium = EXCLUDED.is_premium,
      updated_at = NOW()
  `;

  return userData.spotify_id;
}

/**
 * Create a session cookie for the Spotify user
 */
export function createSessionCookie(spotifyId) {
  return serialize("spotify_user", spotifyId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Get Spotify access token from DB and refresh if expired
 */
export async function getSpotifyAccessToken(spotify_id) {
  const users =
    await sql`SELECT * FROM spotify_users WHERE spotify_id = ${spotify_id}`;
  if (!users.length) throw new Error("No Spotify user found");

  let { access_token, refresh_token, expires_at } = users[0];

  // Refresh token if expired
  if (new Date() >= new Date(expires_at)) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });

    const data = await res.json();
    if (!data.access_token) throw new Error("Failed to refresh token");

    access_token = data.access_token;
    expires_at = new Date(Date.now() + data.expires_in * 1000);

    // Update DB
    await sql`
      UPDATE spotify_users
      SET access_token = ${access_token}, expires_at = ${expires_at}, updated_at = NOW()
      WHERE spotify_id = ${spotify_id}
    `;
  }

  return access_token;
}

/**
 * Generate Spotify Authorization URL
 */
export function getSpotifyAuthUrl() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Missing Spotify env variables");
  }

  // Updated scopes
  const scopes = [
    "user-read-email",
    "user-read-private",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ].join(" ");

  return `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}
