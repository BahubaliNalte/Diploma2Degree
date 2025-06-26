"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";

export type User = {
  uid: string;
  name: string;
  email: string;
  phone: string;
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(database, "Users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([uid, user]: [string, any]) => ({
          uid,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || user["mobile no"] || user.mobile || "",
        }));
        setUsers(arr);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handleDelete = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await remove(ref(database, `Users/${uid}`));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-80"
        />
        <span className="text-gray-500 text-sm">Total: {users.length}</span>
      </div>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#4300FF] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.uid} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.phone}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(u.uid)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
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
