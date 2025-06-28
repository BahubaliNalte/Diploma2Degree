"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";

export type PlusMember = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  paymentId?: string;
};

export default function PlusMemberTable() {
  const [members, setMembers] = useState<PlusMember[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const plusRef = ref(database, "PlusMembers");
    const unsubscribe = onValue(plusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([uid, user]: [string, any]) => ({
          uid,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || user["mobile no"] || user.mobile || "",
          paymentId: user.paymentId || user.payment_id || "",
        }));
        setMembers(arr);
      } else {
        setMembers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.paymentId && m.paymentId.includes(search))
  );

  const handleRemove = async (uid: string) => {
    if (window.confirm("Remove this member from Plus Membership?")) {
      await remove(ref(database, `PlusMembers/${uid}`));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name, email, phone, or payment ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-80"
        />
        <span className="text-gray-500 text-sm">Total: {members.length}</span>
      </div>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#00CAFF] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Payment ID</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Loading members...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No premium/plus members found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.uid} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{m.name}</td>
                  <td className="py-3 px-4">{m.email}</td>
                  <td className="py-3 px-4">{m.phone}</td>
                  <td className="py-3 px-4">{m.paymentId}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleRemove(m.uid)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                    >
                      Remove
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
