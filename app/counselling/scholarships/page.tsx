"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

// Scholarship type
type Scholarship = {
  name: string;
  provider: string;
  eligibility: string;
  amount: string;
  stream: string;
  deadline: string;
  applyLink: string;
};

const casteOptions = [
  "All Castes",
  "EBC",
  "OBC",
  "SC",
  "ST",
  "VJNT",
  "SBC",
  "Minority"
];

export default function ScholarshipsPage() {
  const [caste, setCaste] = useState("");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scholarshipsRef = ref(database, "fund");
    const unsubscribe = onValue(scholarshipsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data as Record<string, any>).map((item) => ({
          name: item.name || item.title || "Scholarship",
          provider: item.provider || item.by || "",
          eligibility: item.eligibility || item.description || "",
          amount: item.amount || "",
          stream: item.stream || "All Streams",
          deadline: item.deadline || "",
          applyLink: item.link || item.applyLink || "",
        })) as Scholarship[];
        setScholarships(arr);
      } else {
        setScholarships([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Only filter by caste (case-insensitive, fallback to all)
  const filtered = scholarships.filter((s) => {
    if (!caste || caste === "All Castes") return true;
    return (
      (s.eligibility && s.eligibility.toLowerCase().includes(caste.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(caste.toLowerCase()))
    );
  });

  const handleNotify = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e0f2ff] to-white px-6 py-16 md:px-20 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-bold text-center text-[#4300FF] mb-10"
      >
        Scholarships for Diploma to Degree Students
      </motion.h1>

      {/* Caste Filter Only */}
      <div className="mb-10 flex justify-center">
        <select
          value={caste}
          onChange={(e) => setCaste(e.target.value)}
          className="p-3 border border-gray-300 rounded w-full max-w-xs text-gray-900 bg-white"
        >
          {casteOptions.map((option, i) => (
            <option key={i} value={option === "All Castes" ? "" : option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Scholarship Cards (Name, Apply Now, View Eligibility only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-center text-gray-500 text-lg col-span-full">
            Loading scholarships...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-lg col-span-full">
            No scholarships found.
          </p>
        ) : (
          filtered.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow border-l-4 border-[#4300FF] relative"
            >
              <h2 className="text-xl font-bold text-[#4300FF]">{s.name}</h2>
              <div className="mt-4 flex gap-3">
                <a
                  href={s.applyLink}
                  target="_blank"
                  className="px-4 py-2 rounded bg-[#00CAFF] text-white hover:bg-[#4300FF] transition"
                >
                  🔗 Apply Now
                </a>
                <button
                  onClick={() => setSelectedScholarship(s)}
                  className="px-4 py-2 rounded border border-[#4300FF] text-[#4300FF] hover:bg-[#4300FF] hover:text-white transition"
                >
                  📄 View Eligibility
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 md:w-1/2 max-w-xl shadow-lg relative">
            <h3 className="text-2xl font-bold text-[#4300FF] mb-4">
              {selectedScholarship.name}
            </h3>
            <p className="text-gray-700">{selectedScholarship.eligibility}</p>
            <button
              onClick={() => setSelectedScholarship(null)}
              className="absolute top-2 right-4 text-xl text-gray-500 hover:text-red-600"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
