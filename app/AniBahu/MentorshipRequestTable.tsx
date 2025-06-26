"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

export type MentorshipRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: string;
  date?: string;
  time?: string;
};

export default function MentorshipRequestTable() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqRef = ref(database, "mentorshipRequests");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, req]: [string, any]) => ({
          id,
          name: req.name || "",
          email: req.email || "",
          phone: req.phone || "",
          status: req.status || "pending",
          date: req.date || "",
          time: req.time || "",
        }));
        setRequests(arr);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = async (id: string, date: string, time: string) => {
    await update(ref(database, `mentorshipRequests/${id}`), { status: "accepted", date, time });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this mentorship request?")) {
      await remove(ref(database, `mentorshipRequests/${id}`));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mentorship Requests</h2>
      <div className="overflow-x-auto rounded-xl shadow mb-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#4300FF] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Time</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{r.name}</td>
                  <td className="py-3 px-4">{r.email}</td>
                  <td className="py-3 px-4">{r.phone}</td>
                  <td className="py-3 px-4 capitalize">{r.status}</td>
                  <td className="py-3 px-4">{r.date}</td>
                  <td className="py-3 px-4">{r.time}</td>
                  <td className="py-3 px-4">
                    {r.status === "pending" ? (
                      <AcceptMentorshipRequest id={r.id} onAccept={handleAccept} />
                    ) : (
                      <span className="text-green-600 font-semibold">Accepted</span>
                    )}
                    <button
                      className="ml-2 px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AcceptMentorshipRequest({ id, onAccept }: { id: string; onAccept: (id: string, date: string, time: string) => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border rounded px-2 py-1 text-sm" />
      <button
        className="bg-green-500 text-white px-2 py-1 rounded text-sm mt-1"
        onClick={() => onAccept(id, date, time)}
        disabled={!date || !time}
      >
        Accept
      </button>
    </div>
  );
}
