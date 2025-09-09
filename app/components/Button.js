"use client";
import { useState } from "react";

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  color = "green", // default color
  fullWidth = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading) return; // prevent double click
    setLoading(true);
    try {
      await onClick?.(e);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    green: "bg-green-600 hover:bg-green-500 focus:ring-green-400",
    blue: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-400",
    purple: "bg-purple-600 hover:bg-purple-500 focus:ring-purple-400",
    red: "bg-red-600 hover:bg-red-500 focus:ring-red-400",
  };

  const selectedColor = colorClasses[color] || colorClasses.green;
  const widthClass = fullWidth ? "w-full" : "inline-flex";

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading}
      className={`
        ${widthClass} justify-center items-center px-6 py-3 rounded-lg font-semibold
        shadow-md hover:shadow-lg transition-all duration-200
        transform focus:outline-none focus:ring-2 focus:ring-offset-2
        text-white ${selectedColor} ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
