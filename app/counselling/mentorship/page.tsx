"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";

export default function MentorshipPage() {
  const [user, setUser] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>("");
  const [sessionTime, setSessionTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Listen for mentorship request status
        const reqRef = ref(database, "mentorshipRequests");
        onValue(reqRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const arr = Object.values(data).filter((r: any) => r.email === u.email);
            if (arr.length > 0) {
              const req = arr[0] as any;
              setRequestStatus(req.status || "pending");
              setSessionDate(req.date || "");
              setSessionTime(req.time || "");
            } else {
              setRequestStatus("");
              setSessionDate("");
              setSessionTime("");
            }
          } else {
            setRequestStatus("");
            setSessionDate("");
            setSessionTime("");
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async () => {
    if (!user) return;
    setRequesting(true);
    await push(ref(database, "mentorshipRequests"), {
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      status: "pending",
    });
    setRequesting(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef4ff] to-[#f8fafc] p-4">
      <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-lg border border-[#e0e7ff]">
        <h1 className="text-3xl font-extrabold text-[#4300FF] mb-4 text-center">1:1 Mentorship</h1>
        <p className="text-gray-700 mb-6 text-center">
          Book a personalized 1:1 mentorship session with our expert counsellors. Get guidance on college selection, career planning, and more.
        </p>
        {/* Request Button or Status */}
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : requestStatus ? (
          <div className="mb-4 text-center">
            <div className="font-semibold text-lg text-blue-500">Request Status: <span className="capitalize">{requestStatus}</span></div>
            {requestStatus === "accepted" && sessionDate && sessionTime && (
              <div className="mt-2 text-green-600 font-medium">Session Scheduled: {sessionDate} at {sessionTime}</div>
            )}
          </div>
        ) : (
          <button
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#4300FF] to-[#00CAFF] text-white font-bold text-lg shadow-md hover:from-[#4300FF] hover:to-[#00CAFF] transition"
            onClick={handleRequest}
            disabled={requesting}
          >
            {requesting ? "Requesting..." : "Request 1:1 Mentorship"}
          </button>
        )}
      </div>
    </main>
  );
}
