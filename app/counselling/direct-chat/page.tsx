"use client";

import React from "react";

export default function DirectChatPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef4ff] to-[#f8fafc] p-4">
      <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-lg border border-[#e0e7ff] flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-[#4300FF] mb-4 text-center">Direct Chat with Counsellor</h1>
        <p className="text-gray-700 mb-6 text-center">
          Chat instantly with our expert counsellors for any queries or support. Click the button below to start a WhatsApp chat.
        </p>
        <a
          href="https://wa.me/918767884789?text=I%20am%20a%20premium%20member%20and%20need%20counselling%20support"
          target="_blank"
          className="w-full py-3 rounded-lg bg-green-500 text-white font-bold text-lg text-center shadow-md hover:bg-green-600 transition"
        >
          Start WhatsApp Chat
        </a>
      </div>
    </main>
  );
}
