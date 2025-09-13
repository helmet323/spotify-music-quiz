"use client";
import { useState, useEffect, useRef } from "react";

export default function useSpotifyQuiz(
  playlistId,
  { snippetDuration = 10000, totalQuestions = 10 } = {}
) {
  const [accessToken, setAccessToken] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pausedPosition, setPausedPosition] = useState(0);
  const [snippetStartPosition, setSnippetStartPosition] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  /** FETCH ACCESS TOKEN **/
  useEffect(() => {
    fetch("/api/spotify/token")
      .then((res) => res.json())
      .then((data) => data.success && setAccessToken(data.accessToken))
      .catch(console.error);
  }, []);

  /** INIT SPOTIFY PLAYER **/
  useEffect(() => {
    if (!playlistId || !accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Spotify Quiz Player",
        getOAuthToken: (cb) => cb(accessToken),
      });

      spotifyPlayer.addListener("ready", ({ device_id }) =>
        setDeviceId(device_id)
      );
      spotifyPlayer
        .connect()
        .then((success) => success && setPlayer(spotifyPlayer));
    };
  }, [playlistId, accessToken]);

  /** FETCH TRACKS **/
  useEffect(() => {
    if (!playlistId) return;
    fetch(`/api/spotify/tracks/${playlistId}`)
      .then((res) => res.json())
      .then((data) => data.success && setTracks(data.tracks))
      .catch(console.error);
  }, [playlistId]);

  /** STOP CURRENT SNIPPET **/
  const stopSnippet = async () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setProgress(0);
    if (player) await player.pause();
  };

  /** HANDLE ANSWER **/
  const handleAnswer = async (answer) => {
    if (!currentTrack) return;

    await stopSnippet();

    const correct = answer === currentTrack.name;
    setFeedback(correct ? "✅ Correct!" : "❌ Wrong!");
    if (correct) setScore((prev) => prev + 1);
    setSelectedAnswer(answer);

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);

    if (nextIndex >= totalQuestions) {
      setCurrentTrack(null); // prevent further play
    }
  };

  /** PLAY RANDOM SNIPPET **/
  const playRandomSnippet = async (reset = false) => {
    if (reset) {
      setQuestionIndex(0);
      setScore(0);
    }

    if (
      (questionIndex >= totalQuestions && !reset) ||
      !tracks.length ||
      !player ||
      !deviceId
    )
      return;

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    setCurrentTrack(randomTrack);
    setSelectedAnswer(null);
    setFeedback("");
    setProgress(0);
    setPausedPosition(0);

    // Multiple choice options
    const incorrect = tracks
      .filter((t) => t.id !== randomTrack.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((t) => t.name);
    setOptions(
      [...incorrect, randomTrack.name].sort(() => 0.5 - Math.random())
    );

    // Random snippet start
    const trackDuration = randomTrack.duration_ms || 180000;
    const randomStart = Math.floor(
      Math.random() * Math.max(0, trackDuration - snippetDuration)
    );
    setSnippetStartPosition(randomStart);

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            uris: [randomTrack.uri],
            position_ms: randomStart,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setIsPlaying(true);
      const snippetStartTime = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - snippetStartTime;
        setProgress(Math.min(elapsed / snippetDuration, 1));
      }, 50);

      timeoutRef.current = setTimeout(stopSnippet, snippetDuration);
    } catch (err) {
      console.error(err);
    }
  };

  /** TOGGLE PLAY/PAUSE **/
  const togglePlayPause = async () => {
    if (
      !player ||
      !currentTrack ||
      selectedAnswer ||
      questionIndex >= totalQuestions
    )
      return;

    try {
      if (isPlaying) {
        const state = await player.getCurrentState();
        if (state) setPausedPosition(state.position);
        await player.pause();
        setIsPlaying(false);
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
      } else {
        // Resume from paused position or snippet start
        const startPos = pausedPosition || snippetStartPosition;
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              uris: [currentTrack.uri],
              position_ms: startPos,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setIsPlaying(true);

        // Calculate elapsed time for progress correctly
        const elapsedBeforePause = pausedPosition
          ? pausedPosition - snippetStartPosition
          : 0;
        const snippetStartTime = Date.now() - elapsedBeforePause;

        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - snippetStartTime;
          setProgress(Math.min(elapsed / snippetDuration, 1));
        }, 50);

        timeoutRef.current = setTimeout(
          stopSnippet,
          snippetDuration -
            (pausedPosition ? pausedPosition - snippetStartPosition : 0)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    currentTrack,
    options,
    selectedAnswer,
    feedback,
    isPlaying,
    progress,
    questionIndex,
    score,
    playRandomSnippet,
    handleAnswer,
    togglePlayPause,
  };
}
