"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Image from "next/image";

export default function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const openPlaylistModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/spotify/playlists");
      const data = await res.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
      } else {
        console.error("Error fetching playlists:", data.error);
      }
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlaylist = (playlistId) => {
    setIsModalOpen(false);
    router.push(`/quiz/${playlistId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎵 Spotify Music Quiz
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Button onClick={openPlaylistModal} fullWidth>
          Start Quiz
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Select a Playlist</h2>

        {loading ? (
          <p className="text-gray-400">Loading playlists...</p>
        ) : playlists.length === 0 ? (
          <p className="text-gray-400">No playlists found.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {playlists.map((pl) => (
              <li
                key={pl.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                onClick={() => handleSelectPlaylist(pl.id)}
              >
                <div className="flex items-center space-x-3">
                  {pl.image && (
                    <Image
                      src={pl.image}
                      alt={pl.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                  )}
                  <span>{pl.name}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {pl.tracks} tracks
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
