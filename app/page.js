"use client";

import Button from "./components/Button";

export default function HomePage() {
  const handleSpotifyLogin = async () => {
    try {
      const res = await fetch("/api/spotify/auth");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get Spotify auth URL", data);
      }
    } catch (err) {
      console.error("Error fetching auth URL:", err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 text-gray-100 p-6">
      <h1 className="text-5xl font-extrabold mb-6 text-center">
        🎵 Spotify Music Quiz
      </h1>
      <p className="text-lg mb-8 text-center max-w-md text-gray-300">
        Test your knowledge and see how well you know your favorite tracks! Log
        in with Spotify to get started.
      </p>
      <Button onClick={handleSpotifyLogin} color="green">
        Log in with Spotify
      </Button>
    </div>
  );
}
