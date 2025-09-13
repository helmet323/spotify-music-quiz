"use client";

import Image from "next/image";
import { FiMusic, FiPlay, FiPause, FiArrowRight } from "react-icons/fi";
import Button from "../../../components/Button";
import { useParams, useRouter } from "next/navigation";
import useSpotifyQuiz from "../../../hooks/useSpotifyQuiz";

export const TOTAL_QUESTIONS = 2;
export const SNIPPET_DURATION = 10000;

export default function QuizPage() {
  const router = useRouter();
  const { id: playlistId } = useParams();
  const {
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
  } = useSpotifyQuiz(playlistId, {
    snippetDuration: SNIPPET_DURATION,
    totalQuestions: TOTAL_QUESTIONS,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">🎵 Spotify Quiz</h1>

      {questionIndex < TOTAL_QUESTIONS && (
        <h2 className="text-lg mb-4">
          Question {questionIndex + 1} / {TOTAL_QUESTIONS}
        </h2>
      )}

      {/* Cover */}
      <div className="relative w-64 h-64 mb-2 flex items-center justify-center bg-gray-800 rounded-xl shadow-lg">
        {selectedAnswer && currentTrack?.image ? (
          <Image
            src={currentTrack.image}
            alt={currentTrack.name}
            fill
            className="rounded-xl object-cover"
          />
        ) : (
          <FiMusic className="text-white text-6xl" />
        )}

        {/* Play/Pause Button */}
        {currentTrack && !selectedAnswer && questionIndex < TOTAL_QUESTIONS && (
          <button
            onClick={togglePlayPause}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-full transition hover:opacity-80"
          >
            {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {currentTrack && !selectedAnswer && questionIndex < TOTAL_QUESTIONS && (
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-2 bg-green-500 rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {/* Start Quiz */}
      {!currentTrack && questionIndex < TOTAL_QUESTIONS && (
        <Button onClick={() => playRandomSnippet(true)}>Start Quiz</Button>
      )}

      {/* Multiple Choice */}
      {currentTrack && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mt-6">
          {options.map((option) => {
            const isCorrect = option === currentTrack.name;
            const isSelected = option === selectedAnswer;
            let stateClasses = "bg-white text-gray-900 hover:bg-gray-100";

            if (selectedAnswer) {
              if (isCorrect)
                stateClasses = "bg-green-500 text-white hover:bg-green-600";
              else if (isSelected)
                stateClasses = "bg-red-500 text-white hover:bg-red-600";
              else stateClasses = "bg-gray-200 text-gray-600";
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer || questionIndex >= TOTAL_QUESTIONS}
                className={`w-full py-6 px-8 rounded-2xl shadow-lg border border-gray-300 font-semibold text-center ${stateClasses}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {feedback && <p className="mt-4 text-xl font-bold">{feedback}</p>}

      {/* Next Button */}
      {selectedAnswer && questionIndex < TOTAL_QUESTIONS && (
        <Button
          onClick={() => playRandomSnippet()}
          className="mt-4 flex items-center gap-2"
        >
          Next <FiArrowRight />
        </Button>
      )}

      {/* Quiz Finished */}
      {questionIndex >= TOTAL_QUESTIONS && (
        <div className="flex flex-col items-center mt-6 space-y-4">
          <p className="text-2xl font-bold">
            Quiz finished! Your score: {score} / {TOTAL_QUESTIONS}
          </p>
          <div className="flex gap-4">
            <Button onClick={() => playRandomSnippet(true)}>Play Again</Button>
            <Button onClick={() => router.push("/menu")}>Back to Menu</Button>
          </div>
        </div>
      )}
    </div>
  );
}
