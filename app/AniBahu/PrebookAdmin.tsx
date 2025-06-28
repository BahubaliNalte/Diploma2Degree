"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

export default function PrebookAdmin() {
  const [prebooks, setPrebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prebookRef = dbRef(database, "prebook");
    const unsubscribe = onValue(prebookRef, (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(child => {
        arr.push({ id: child.key, ...child.val() });
      });
      setPrebooks(arr.reverse());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#4300FF]">Prebooked Users</h1>
      {loading ? (
        <div>Loading...</div>
      ) : prebooks.length === 0 ? (
        <div>No prebooked users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white">
            <thead>
              <tr className="bg-[#eef4ff]">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {prebooks.map((user) => (
                <tr key={user.id} className="border-b hover:bg-[#f0f4ff]">
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.phone}</td>
                  <td className="px-4 py-2 border text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
