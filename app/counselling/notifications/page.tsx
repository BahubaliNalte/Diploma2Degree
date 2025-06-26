"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function CounsellingNotifications() {
  const [announcements, setAnnouncements] = useState<{ message: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const annRef = ref(database, "n&a");
    const unsubscribe = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => ({
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-[#f8fafc] flex items-center justify-center py-10 px-2">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-[#e0e7ff]">
        <h2 className="text-3xl font-extrabold text-[#4300FF] mb-6 text-center flex items-center justify-center gap-2">
          <svg className="w-8 h-8 text-[#00CAFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
          Notifications & Announcements
        </h2>
        {loading ? (
          <div className="text-gray-500 text-center py-8">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No announcements yet.</div>
        ) : (
          <ul className="space-y-5">
            {announcements.map((a, i) => (
              <li key={i} className="bg-gradient-to-r from-[#e0e7ff] to-[#f0f4ff] border-l-4 border-[#4300FF] rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <span className="text-lg font-medium text-[#1E293B]">{a.message}</span>
                <span className="text-xs text-gray-500 md:text-right mt-2 md:mt-0">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
