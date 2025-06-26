"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, push } from "firebase/database";

export default function ProjectRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    description: "",
    category: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Push form data to Firebase Realtime Database under 'project-request' node
    await push(ref(database, "project-request"), form);
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", title: "", description: "", category: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4300FF] to-[#00FFDE] px-4 py-16 text-gray-900 font-poppins">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-[#4300FF] mb-4">
          Submit Your Project Idea
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Share your concept and our team will help you develop it into a full project!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
            />
            <input
              type="tel"
              name="phone"
              required
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
            />
            <input
              type="text"
              name="title"
              required
              placeholder="Project Title"
              value={form.title}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
            />
          </div>

          <textarea
            required
            name="description"
            placeholder="Project Description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
          />

          <select
            required
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-gray-900 bg-white"
          >
            <option value="">Select Project Category</option>
            <option value="web">Web Development</option>
            <option value="android">Android</option>
            <option value="iot">IoT</option>
            <option value="ml">Machine Learning</option>
            <option value="embedded">Embedded Systems</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-[#4300FF] text-white w-full py-3 rounded-lg shadow hover:bg-[#00CAFF] transition"
          >
            Submit Project Request
          </motion.button>
        </form>

        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-green-600 font-semibold"
          >
            ✅ Your project request has been submitted!
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
