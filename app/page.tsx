"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaLinkedin, FaBars, FaBell, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { app, database } from "../lib/firebase"; // Adjust the path based on your firebase config
import ClientReviewsLanding from "./ClientReviewsLanding";
import FeedbackImagesLanding from "./FeedbackImagesLanding";

export default function HomePage() {
  const [currentReview, setCurrentReview] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showNotifDot, setShowNotifDot] = useState(false);
  const [lastSeenNotif, setLastSeenNotif] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getDatabase(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
        // Check Plus Member status
        const plusRef = ref(db, `PlusMembers/${user.uid}`);
        const plusSnap = await get(plusRef);
        setIsPlusMember(plusSnap.exists());
      } else {
        setIsPlusMember(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Notification bell logic
  useEffect(() => {
    // Get last seen notification from localStorage
    const lastSeen = localStorage.getItem("d2d_last_seen_notif");
    setLastSeenNotif(lastSeen);
    // Listen for latest notification
    const annRef = ref(database, "n&a");
    const unsub = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => a.createdAt || "").sort();
        const latest = arr[arr.length - 1];
        if (latest && latest !== lastSeen) {
          setShowNotifDot(true);
        } else {
          setShowNotifDot(false);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleNotifClick = () => {
    // Mark latest notification as seen
    const annRef = ref(database, "n&a");
    onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => a.createdAt || "").sort();
        const latest = arr[arr.length - 1];
        if (latest) {
          localStorage.setItem("d2d_last_seen_notif", latest);
          setShowNotifDot(false);
        }
      }
    }, { onlyOnce: true });
  };

  return (
    <main className="min-h-screen bg-[#F0F4FF] text-[#1E293B] font-poppins">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md py-4 px-6 md:px-12 z-50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/Web Images/d2d-logo1.png"
              alt="D2D Icon"
              className="h-8 w-auto -mr-[10px] -ml-[35px] sm:ml-0 sm:mr-0 cursor-pointer"
            />
            <div className="flex flex-col justify-center">
              <img src="/Web Images/d2d-logo2.png" alt="Diploma2Degree" className="h-6 sm:h-8 w-auto cursor-pointer" />
              <span className="text-[11px] sm:text-xs font-medium text-slate-600">
                तुमचे <span className="text-blue-600">Percentage</span> + आमचे <span className="text-pink-500">Guidance</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Notification icon always visible on mobile and desktop */}
        <div className="flex gap-4 items-center">
          <Link href="/counselling/notifications" className="relative text-slate-700 hover:text-blue-600 transition text-2xl flex items-center" title="Notifications" onClick={handleNotifClick}>
            <FaBell />
            {showNotifDot && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
          </Link>
          <div className="hidden md:flex gap-4 items-center">
            <Link
              href="/profile"
              className="text-slate-700 hover:text-blue-600 font-medium transition"
            >
              Profile
            </Link>
            {userData ? null : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-blue-600 font-medium transition">Login</Link>
                <Link href="/signup" className="bg-pink-500 text-white px-5 py-2 rounded-full hover:bg-pink-600 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl text-slate-700">
          <FaBars />
        </button>
        {menuOpen && (
          <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl p-4 flex flex-col gap-3 z-50 w-44 text-center">
            <Link
              href="/profile"
              className="text-slate-700 hover:text-blue-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            {/* Remove notification icon from hamburger menu */}
            {userData ? null : (
              <>
                <Link href="/login" className="text-slate-700 hover:underline">Login</Link>
                <Link href="/signup" className="bg-pink-500 text-white py-2 rounded-full hover:bg-pink-600 transition">Sign Up</Link>
              </>
            )}
          </div>
        )}

      </nav>


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-slate-800"
        >
          Your Gateway from <span className="text-blue-600">Diploma</span> to <span className="text-pink-500">Degree</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-slate-600 mt-5 max-w-2xl mx-auto"
        >
          Get expert counselling, admission alerts, and custom project support — all tailored for diploma engineering students.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
<<<<<<< HEAD
          <Link href="/counselling/premium" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:from-yellow-500 hover:to-yellow-600 transition">
            Premium Counselling
          </Link>
          <Link href="/counselling" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition">Start Counselling</Link>
          <Link href="/project-request" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 transition">Request a Project</Link>
=======
          <Link href="/counselling" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition">Start Counselling</Link>
          <Link href="/project-request" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 transition">Request a Project</Link>
          <Link href="/counselling/premium" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:from-yellow-500 hover:to-yellow-600 transition">
            Premium Counselling
          </Link>
>>>>>>> 319ab366af1a7894d15d8a336cf1997cea2e37e1
        </motion.div>
      </section>

      {/* What We Offer */}
      <section className="bg-white py-20 px-6 md:px-20">
        <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">What We Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              title: "College Counselling",
              desc: "Get personalized college suggestions based on your scores, preferences and location.",
            },
            {
              title: "Project Development",
              desc: "Submit your ideas and get assistance building academic or real-world engineering projects.",
            },
            {
              title: "Admission Notifications",
              desc: "Never miss deadlines — receive instant alerts for cutoff dates and new admissions.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h4 className="text-lg font-semibold text-blue-700 mb-2">{item.title}</h4>
              <p className="text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Client Reviews */}
      <section className="bg-[#F0F4FF] py-20 px-6 md:px-20 text-center">
        <ClientReviewsLanding />
        {/* Feedback Screenshots */}
        <FeedbackImagesLanding />
      </section>

      {/* About Us */}
      <section className="bg-white py-16 px-6 md:px-20">
        <div className="max-w-2xl mx-auto text-center rounded-3xl shadow-xl p-8 border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          
          <h3 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-3">About Us</h3>
          <p className="text-lg md:text-xl text-slate-700 mb-4 font-medium">
            <span className="text-blue-700 font-bold">Diploma2Degree</span> empowers diploma holders to achieve their engineering dreams with expert guidance, real-time alerts, and a supportive community.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-4">
            <div className="flex-1 bg-blue-50 rounded-xl p-4 shadow border border-blue-100">
              <span className="block text-blue-600 font-bold text-lg mb-1">Personalized Counselling</span>
              <span className="text-slate-600 text-base">Get college suggestions and admission support tailored to you.</span>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-4 shadow border border-blue-100">
              <span className="block text-blue-600 font-bold text-lg mb-1">Project & Career Help</span>
              <span className="text-slate-600 text-base">Expert help for projects, mentorship, and career planning.</span>
            </div>
          </div>
          <p className="text-base md:text-lg text-slate-700 font-semibold mb-2">
            <span className="text-blue-700 font-bold">Join thousands</span> who found their path with us.
          </p>
          <Link href="/counselling" className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow hover:bg-blue-700 transition">Start Your Journey</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-16 px-6 md:px-20 text-center">
        <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
        <p className="text-sm mb-1">📍 Pune, Maharashtra, India</p>
        <p className="text-sm mb-1">📞 +91 86259 54301, +91 74991 89032</p>
        <p className="text-sm mb-1">📧 <a href="mailto:diplomatwodegree@gmail.com" className="underline hover:text-yellow-300">diplomatwodegree@gmail.com</a></p>
        <div className="flex justify-center gap-6 text-xl mb-6 mt-4">
          <a href="https://chat.whatsapp.com/J7CIECuRE8P3hFqRtca1o5" target="_blank" rel="noopener noreferrer" title="WhatsApp" className="hover:text-green-400 flex items-center gap-1">
            <FaWhatsapp className="inline w-6 h-6" />
          </a>
          <a href="https://www.instagram.com/diploma_2_degree?utm_source=qr&igsh=MTVnYmw1Nzh2cWV2OA==" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
          <a href="https://www.facebook.com/share/163fQuaUqb/" target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebook /></a>
          <a href="https://www.linkedin.com/in/diploma2degree-13aa41370?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
        </div>
        <p className="text-xs text-blue-100">
          &copy; {new Date().getFullYear()} Diploma2Degree. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
