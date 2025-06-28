"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, remove, update } from "firebase/database";

export type ProjectRequest = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  description?: string;
  category?: string;
  [key: string]: any;
};

export default function ProjectRequestTable() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqRef = ref(database, "project-request");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, req]: [string, any]) => ({
          id,
          name: req.name || "",
          email: req.email || "",
          phone: req.phone || req["mobile no"] || req.mobile || "",
          title: req.title || req.projectTitle || "",
          description: req.description || req.details || req.projectDescription || "",
          category: req.category || req.projectCategory || req.type || "",
          ...req
        }));
        setRequests(arr);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await update(ref(database, `project-request/${id}`), { status });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this project request?")) {
      await remove(ref(database, `project-request/${id}`));
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-xl shadow mb-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#4300FF] text-white">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Project Title</th>
              <th className="py-3 px-4 text-left">Project Category</th>
              <th className="py-3 px-4 text-left">Project Description</th>
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
                  No project requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{r.name}</td>
                  <td className="py-3 px-4">{r.email}</td>
                  <td className="py-3 px-4">{r.phone}</td>
                  <td className="py-3 px-4">{r.title}</td>
                  <td className="py-3 px-4">{r.category}</td>
                  <td className="py-3 px-4">{r.description}</td>
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
