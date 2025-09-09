import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "No code provided" }),
        { status: 400 }
      );
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    // Exchange code for access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get access token" }),
        { status: 400 }
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user profile
    const userRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userRes.json();

    const { id: spotify_id, display_name, email, product } = userData;
    const is_premium = product === "premium";
    const expires_at = new Date(Date.now() + expires_in * 1000);

    // Upsert into database
    const result = await sql`
      INSERT INTO spotify_users
        (spotify_id, display_name, email, access_token, refresh_token, expires_at, is_premium)
      VALUES
        (${spotify_id}, ${display_name}, ${email}, ${access_token}, ${refresh_token}, ${expires_at}, ${is_premium})
      ON CONFLICT (spotify_id)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        is_premium = EXCLUDED.is_premium,
        updated_at = NOW()
      RETURNING *;
    `;

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/menu",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
