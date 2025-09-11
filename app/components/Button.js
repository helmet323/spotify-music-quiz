"use client";
import { useState } from "react";

export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  color = "green",
  fullWidth = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading) return;
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

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading}
      className={`
        ${fullWidth ? "w-full" : "inline-flex"} justify-center items-center
        px-6 py-3 rounded-lg font-semibold shadow-md transition
        focus:outline-none focus:ring-2 focus:ring-offset-2
        text-white ${colorClasses[color] || colorClasses.green}
        ${
          loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
        } ${className}
      `}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
