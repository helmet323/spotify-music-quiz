"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-gray-900 p-6 text-gray-100 shadow-2xl ring-1 ring-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
        >
          ✕
        </button>

        {title && <h2 className="mb-5 text-2xl font-bold">{title}</h2>}

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
