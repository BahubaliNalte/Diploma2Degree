"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, remove } from "firebase/database";

export type Announcement = {
  id: string;
  message: string;
  createdAt: string;
};

export default function AnnouncementAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const annRef = ref(database, "n&a");
    const unsubscribe = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, a]: [string, any]) => ({
          id,
          message: a.message || "",
          createdAt: a.createdAt || "",
        })).sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
        setAnnouncements(arr);
      } else {
        setAnnouncements([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await push(ref(database, "n&a"), {
      message,
      createdAt: new Date().toISOString(),
    });
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this announcement?")) {
      await remove(ref(database, `n&a/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter announcement..."
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="px-4 py-2 rounded bg-[#4300FF] text-white font-semibold">Add</button>
      </form>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-bold mb-4 text-[#4300FF]">All Announcements</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-500">No announcements yet.</div>
        ) : (
          <ul className="space-y-3">
            {announcements.map(a => (
              <li key={a.id} className="flex justify-between items-center border-b pb-2">
                <span>{a.message}</span>
                <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:underline text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
