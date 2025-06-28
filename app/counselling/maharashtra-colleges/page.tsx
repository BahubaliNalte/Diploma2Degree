"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface Cutoff {
  Category: string;
  Rank: string;
  Score: string;
}

interface College {
  [key: string]: any;
  "College Code": string;
  "College Name": string;
  "Choice Code": string;
  "Course Name": string;
  Cutoffs: Cutoff[];
  City: string;
  Status: string;
  website?: string;
}

const unique = (array: string[]) => Array.from(new Set(array));

export default function MaharashtraCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clgRef = ref(database, "clgdb");
    const unsubscribe = onValue(clgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data);
        setColleges(arr as College[]);
      } else {
        setColleges([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Deduplicate colleges by normalized College Name + City
  function normalize(str: string) {
    return str.trim().toLowerCase().replace(/\s+/g, " ");
  }
  const uniqueColleges = Array.from(
    new Map(
      colleges.map((c) => [normalize(c["College Name"]) + "-" + normalize(c.City), c])
    ).values()
  );

  const cities = unique(uniqueColleges.map((c) => c.City)).sort((a, b) => a.localeCompare(b));
  const statuses = unique(uniqueColleges.map((c) => c.Status)).sort((a, b) => a.localeCompare(b));

  const filteredColleges = uniqueColleges.filter((college) => {
    const matchesSearch =
      search === "" ||
      (college["College Name"] &&
        college["College Name"].toLowerCase().includes(search.toLowerCase()));
    const matchesLocation = location === "" || college.City === location;
    const matchesStatus = status === "" || college.Status === status;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#ecf4ff] to-white px-6 py-16 md:px-20 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-bold text-center text-[#4300FF] mb-10"
      >
        🏫 All Engineering Colleges in Maharashtra
      </motion.h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* College Name Filter */}
        <input
          type="text"
          placeholder="🔍 Search by College Name..."
          className="p-3 border border-gray-300 rounded w-full text-gray-900 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* City Filter */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-3 border border-gray-300 rounded w-full text-gray-900 bg-white"
        >
          <option value="">📍 Filter by City</option>
          {cities.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-3 border border-gray-300 rounded w-full text-gray-900 bg-white"
        >
          <option value="">🏷️ Filter by Status</option>
          {statuses.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Colleges List */}
      {loading ? (
        <p className="text-center text-gray-500 text-lg col-span-full">
          Loading colleges...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.length === 0 ? (
            <p className="text-center text-gray-600 text-lg col-span-full">
              No colleges match your filters.
            </p>
          ) : (
            filteredColleges.map((college, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg border-l-4 border-[#4300FF] transition"
              >
                <h2 className="text-xl font-semibold text-[#4300FF]">
                  {college["College Name"]}
                </h2>
                <p className="text-gray-600 mt-1">
                  📍 <span className="font-medium">City:</span> {college.City}
                </p>
                <p className="text-gray-600 mb-3">
                  🎯 <span className="font-medium">Status:</span> {college.Status}
                </p>
              </motion.div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
