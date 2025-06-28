"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, remove, update } from "firebase/database";
import UploadClgListButton from "./UploadClgListButton";

export type CollegeRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch?: string;
  status?: string;
  createdAt?: string;
  caste?: string;
  percentage?: string;
  city?: string;
  adminClgListUrl?: string;
};

export default function CollegeRequestTable() {
  const [requests, setRequests] = useState<CollegeRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqRef = ref(database, "requestclglist");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, req]: [string, any]) => ({
          id,
          name: req.name || "",
          email: req.email || "",
          phone: req.phone || req["mobile no"] || req.mobile || "",
          branch: Array.isArray(req.branches) ? req.branches.join(", ") : (req.branch || req.stream || ""),
          status: req.status || "pending",
          createdAt: req.createdAt || req.date || "",
          caste: req.caste || "",
          percentage: req.percentage || req.percent || "",
          city: Array.isArray(req.cities) ? req.cities.join(", ") : (req.city || req.cities || ""),
          adminClgListUrl: req.adminClgListUrl || "",
        }));
        setRequests(arr);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      (r.branch && r.branch.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatus = async (id: string, status: string) => {
    await update(ref(database, `requestclglist/${id}`), { status });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this request?")) {
      await remove(ref(database, `requestclglist/${id}`));
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow mb-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#4300FF] text-white">
              <th className="py-3 px-4 text-left">Caste</th>
              <th className="py-3 px-4 text-left">% Marks</th>
              <th className="py-3 px-4 text-left">City</th>
              <th className="py-3 px-4 text-left">Branch</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Best Clg List</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{r.caste}</td>
                  <td className="py-3 px-4">{r.percentage}</td>
                  <td className="py-3 px-4">{r.city}</td>
                  <td className="py-3 px-4">{r.branch}</td>
                  <td className="py-3 px-4">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatus(r.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm text-gray-900 bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {r.adminClgListUrl ? (
                      <a href={r.adminClgListUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                    ) : (
                      <UploadClgListButton requestId={r.id} />
                    )}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(r.id)}
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
