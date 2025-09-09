"use client";

import Button from "../../components/Button";

export default function MenuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎵 Spotify Music Quiz Menu
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Button onClick={() => alert("Select Playlist clicked")} fullWidth>
          Select Playlist
        </Button>

        <Button onClick={() => alert("Start Quiz clicked")} fullWidth>
          Start Quiz
        </Button>

        <Button onClick={() => alert("Profile clicked")} fullWidth>
          Profile
        </Button>
      </div>
    </div>
  );
}
