"use client";

import React, { useEffect, useState } from "react";
import { auth, database } from "@/lib/firebase";
import { onAuthStateChanged, signOut, browserLocalPersistence, setPersistence } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { useRouter } from "next/navigation";

type UserData = {
  email: string;
  name: string;
  phone: string;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserUid(user.uid);
          setIsGoogleUser(user.providerData.some((p) => p.providerId === "google.com"));
          const userRef = ref(database, `Users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            let phone = data.phone || data["mobile no"] || data.mobile || "";
            if (!phone) {
              const plusRef = ref(database, `PlusMembers/${user.uid}`);
              const plusSnap = await get(plusRef);
              if (plusSnap.exists()) {
                const plusData = plusSnap.val();
                phone = plusData.phone || "";
              }
            }
            setUserData({
              email: data.email || "",
              name: data.name || "",
              phone,
            });
            // Show add phone if Google user and phone is missing
            setShowAddPhone(!phone && user.providerData.some((p) => p.providerId === "google.com"));
          }
          // Check Plus Member status
          const plusRef = ref(database, `PlusMembers/${user.uid}`);
          const plusSnap = await get(plusRef);
          setIsPlusMember(plusSnap.exists());
        } else {
          setUserData({ email: '', name: '', phone: '' });
          setIsPlusMember(false);
          setShowAddPhone(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    });
  }, [router]);

  const handleAddPhone = async () => {
    if (!userUid || !newPhone) return;
    const userRef = ref(database, `Users/${userUid}`);
    await update(userRef, { phone: newPhone });
    setUserData((prev) => prev ? { ...prev, phone: newPhone } : prev);
    setShowAddPhone(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eef4ff] to-[#f8fafc]">
      <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-md border border-[#e0e7ff] relative">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4300FF] to-[#00CAFF] flex items-center justify-center mb-3 shadow-lg">
            <span className="text-4xl text-white font-bold">
              {(userData && userData.name) ? userData.name[0].toUpperCase() : "U"}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#4300FF] mb-1 tracking-tight">
            {userData ? userData.name : ""}
          </h2>
          {isPlusMember && (
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-1 rounded-full font-semibold text-xs shadow-md mb-2 animate-pulse">
              ⭐ Premium Member
            </span>
          )}
        </div>
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[#4300FF] text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <span className="text-gray-700 font-medium text-lg">
              {userData ? userData.name : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#00CAFF] text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0v1a4 4 0 01-8 0v-1m8 0a4 4 0 00-8 0"
                />
              </svg>
            </span>
            <span className="text-gray-700 font-medium text-lg">
              {userData ? userData.email : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#22c55e] text-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </span>
            <span className="text-gray-700 font-medium text-lg">
              {userData ? userData.phone : ""}
            </span>
          </div>
          {showAddPhone && (
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="tel"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                placeholder="Add your phone number"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white rounded px-4 py-2 font-semibold hover:bg-blue-600"
                onClick={handleAddPhone}
              >
                Save Phone Number
              </button>
            </div>
          )}
        </div>
        <button
          className="mt-2 w-full py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg shadow-md hover:from-red-600 hover:to-pink-600 transition"
          onClick={async () => {
            await signOut(auth);
            router.push("/login");
          }}
        >
          Log Out
        </button>
      </div>
    </main>
  );
}