"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Script from "next/script";
import { auth, database } from "@/lib/firebase"; // Only import 'auth' if 'db' is not exported
import { ref as dbRef, set, onValue, get } from "firebase/database";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PremiumBanners from "./PremiumBanners";
import FeedbackImagesPremium from "./FeedbackImagesPremium";

const faqs = [
  {
    question: "What is included in the premium counselling?",
    answer:
      "You'll get 1:1 expert guidance, personalized college prediction, documentation support (SOP, Resume), and priority support with the Direct Chat.",
  },
  {
    question: "Is this service online or offline?",
    answer:
      "The sessions are fully online via Google Meet or Zoom. You'll be assigned a mentor within 24 hours.",
  },
  {
    question: "Is my data safe on this platform?",
    answer:
      "Yes, your data is protected using Firebase Authentication and Realtime Database security rules. We do not share your personal information.",
  },
];

const packages = [
  {
    title: "Premium Plan (validity upto 2 CAP Round) ",
    originalPrice: "₹999",
    discountedPrice: "₹",
    features: [
      "🎓 1:1 Mentorship",
      "🤖 Advance AI-Based College List",
      "🧭 Career Planning Dashboard",
    ],
    highlight: true,
  },
];

export default function PremiumPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phonePrompt, setPhonePrompt] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [premiumPrice, setPremiumPrice] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authUnsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsPlusMember(false);
        setLoading(false);
        return;
      }
      try {
        const plusRef = dbRef(database, `PlusMembers/${user.uid}`);
        const snapshot = await get(plusRef);
        setIsPlusMember(snapshot.exists());
      } catch (err) {
        setIsPlusMember(false);
      }
      setLoading(false);
    });
    return () => authUnsub();
  }, []);

  useEffect(() => {
    // Listen for real-time premium price updates from AppConfig in Firebase
    const priceRef = dbRef(database, "AppConfig/PlusMembershipPrice");
    const unsubscribe = onValue(priceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const priceNum = Number(val);
        setPremiumPrice(!isNaN(priceNum) ? priceNum : null);
      } else {
        setPremiumPrice(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBuyNow = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to continue with the payment.");
      return;
    }
    let phone = user.phoneNumber || "";
    // Try to get phone from DB if not present in Auth
    if (!phone) {
      const phoneSnap = await get(dbRef(database, 'Users/' + user.uid + '/phone'));
      if (phoneSnap.exists()) {
        phone = phoneSnap.val();
      }
    }
    // If Google login and no phone, prompt for phone
    if (user.providerData.some((p) => p.providerId === "google.com") && !phone) {
      setShowPhoneModal(true);
      setPhonePrompt("Please enter your phone number before purchasing premium membership.");
      return;
    }
    startRazorpay(phone);
  };

  // Save phone and continue to payment
  const handleSavePhoneAndPay = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!/^\d{10}$/.test(phoneInput)) {
      setPhonePrompt("Please enter a valid 10-digit phone number.");
      return;
    }
    // Save phone to DB
    await set(dbRef(database, 'Users/' + user.uid + '/phone'), phoneInput);
    setShowPhoneModal(false);
    startRazorpay(phoneInput);
  };

  // Razorpay logic
  const startRazorpay = async (phone: string) => {
    const user = auth.currentUser;
    if (!user) return;
    if (premiumPrice === null) {
      toast.error("Unable to fetch premium price. Please try again later.");
      return;
    }
    // 1. Create order on backend
    let orderId = null;
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: premiumPrice * 100, currency: "INR" }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Order creation failed");
      orderId = orderData.order.id;
    } catch (err) {
      toast.error("Failed to create payment order. Please try again later.");
      return;
    }
    // 2. Open Razorpay checkout with order_id
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string,
      amount: premiumPrice * 100, // Use dynamic price
      currency: "INR",
      name: "Diploma2Degree Premium Counselling",
      description: "Premium Counselling Package",
      image: "/Web Images/d2d-logo1.png",
      order_id: orderId,
      handler: async function (response: any) {
        // Secure: verify payment on backend before updating DB
        const verifyRes = await fetch("/api/verify-razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          const memberData = {
            paymentId: response.razorpay_payment_id,
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone: phone, // Always use the phone passed in
            purchasedAt: new Date().toISOString(),
            price: premiumPrice, // Save dynamic price
            timestamp: Date.now(),
          };
          set(dbRef(database, "PlusMembers/" + user.uid), memberData)
            .then(() => {
              toast.success("Payment successful! Redirecting...");
              setTimeout(() => {
                router.push("/thank-you");
              }, 2000);
            })
            .catch((err) => {
              console.error("Firebase Error:", err);
              toast.error("Payment saved, but something went wrong.");
            });
        } else {
          toast.error("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: user.displayName || "",
        email: user.email || "",
        contact: phone,
      },
      theme: {
        color: "#4300FF",
      },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h3 className="text-lg font-bold mb-2 text-[#4300FF]">Add Phone Number</h3>
            <p className="mb-2 text-sm text-gray-700">{phonePrompt}</p>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 mb-3 text-gray-900 bg-white"
              placeholder="Enter 10-digit phone number"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              maxLength={10}
            />
            <button
              className="w-full py-2 rounded bg-[#4300FF] text-white font-semibold mb-2"
              onClick={handleSavePhoneAndPay}
            >
              Save & Continue
            </button>
            <button
              className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold"
              onClick={() => setShowPhoneModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-gradient-to-br from-[#eef4ff] to-white py-16 px-6 md:px-20 font-poppins">
        {/* Sliding Image Banner */}
        <div className="w-full mb-10 md:rounded-2xl overflow-hidden">
          <PremiumBanners />
        </div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold text-center text-[#4300FF] mb-6"
        >
          🎓 Premium Counselling Services
        </motion.h1>

        <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
          Get expert support to choose the best engineering college and maximize
          your chances for admission. Choose a plan and get started today!
        </p>
        {loading ? (
          <div className="text-center">Checking membership...</div>
        ) : isPlusMember ? (
          <div className="max-w-4xl mx-auto mb-20 grid gap-8 md:grid-cols-3">
            <a href="/counselling/mentorship" className="p-8 rounded-2xl border-2 border-[#4300FF] shadow-xl bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff] text-gray-900 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform duration-200">
              <div className="mb-4 text-5xl">🤝</div>
              <h2 className="text-2xl font-bold mb-2 text-[#4300FF]">1:1 Mentorship</h2>
              <p className="text-gray-700 text-center">Get personalized guidance from our experts for your college journey.</p>
              <span className="mt-4 inline-block bg-[#4300FF] text-white px-4 py-1 rounded-full text-xs font-semibold">Book Now</span>
            </a>
            <a href="/counselling/best-college-list" className="p-8 rounded-2xl border-2 border-[#00CAFF] shadow-xl bg-gradient-to-br from-[#e0f7fa] to-[#f0f4ff] text-gray-900 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform duration-200">
              <div className="mb-4 text-5xl">🏆</div>
              <h2 className="text-2xl font-bold mb-2 text-[#00CAFF]">Best College List</h2>
              <p className="text-gray-700 text-center">Access a curated list of top colleges tailored to your profile.</p>
              <span className="mt-4 inline-block bg-[#00CAFF] text-white px-4 py-1 rounded-full text-xs font-semibold">Request List</span>
            </a>
            <a href="/counselling/direct-chat" className="p-8 rounded-2xl border-2 border-[#22c55e] shadow-xl bg-gradient-to-br from-[#e0ffe7] to-[#f0f4ff] text-gray-900 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform duration-200">
              <div className="mb-4 text-5xl">💬</div>
              <h2 className="text-2xl font-bold mb-2 text-[#22c55e]">Direct Chat</h2>
              <p className="text-gray-700 text-center">Chat directly with our counsellors for instant support.</p>
              <span className="mt-4 inline-block bg-[#22c55e] text-white px-4 py-1 rounded-full text-xs font-semibold">Start Chat</span>
            </a>
          </div>
        ) : (
          <div className="max-w-md mx-auto mb-20">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border shadow-md ${pkg.highlight ? "bg-[#4300FF] text-white border-[#4300FF]" : "bg-white text-gray-800"}`}
              >
                <h2 className="text-2xl font-bold mb-2 text-white">{pkg.title}</h2>
                <p className="text-3xl font-semibold mb-2">
                  <span className="line-through text-gray-300 mr-2">₹999</span>
                  <span className="text-yellow-300">
                    ₹{premiumPrice !== null ? premiumPrice : "--"}
                  </span>
                </p>
                <p className="text-lg mb-4 font-medium">What you get:</p>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2">
                      ✅ {f}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-2 rounded bg-white text-[#4300FF] hover:bg-gray-100 transition font-semibold"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-10">
          <div className="flex flex-col items-center bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] rounded-2xl shadow p-6">
            <span className="text-4xl mb-2">🎓</span>
            <div className="font-bold text-lg text-[#4300FF] mb-1 text-center">1:1 Mentorship</div>
            <div className="text-gray-600 text-center text-sm">Personal guidance from experts for your journey</div>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-br from-[#e0f7fa] to-[#e0e7ff] rounded-2xl shadow p-6">
            <span className="text-4xl mb-2">🤖</span>
            <div className="font-bold text-lg text-[#00CAFF] mb-1 text-center">Advance AI-Based College List</div>
            <div className="text-gray-600 text-center text-sm">Smart, personalized college suggestions</div>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-br from-[#fffbe0] to-[#e0e7ff] rounded-2xl shadow p-6">
            <span className="text-4xl mb-2">📊</span>
            <div className="font-bold text-lg text-[#eab308] mb-1 text-center">Validity up to 2 CAP Round</div>
            <div className="text-gray-600 text-center text-sm">Access features for both CAP rounds</div>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-br from-[#e0ffe7] to-[#e0e7ff] rounded-2xl shadow p-6">
            <span className="text-4xl mb-2">🧭</span>
            <div className="font-bold text-lg text-[#22c55e] mb-1 text-center">Career Planning Dashboard</div>
            <div className="text-gray-600 text-center text-sm">Track and plan your career with ease</div>
          </div>
        </div>

        
      
       {/* Client Reviews */}
          <section className="bg-[#F0F4FF] py-20 px-6 md:px-20 text-center">
            {/* Feedback Screenshots */}
            <FeedbackImagesPremium />
          </section>

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-center mb-6 text-[#4300FF]">
          🙋 Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full px-4 py-3 text-left font-medium text-[#4300FF] bg-white hover:bg-gray-100 transition"
              >
                {faq.question}
              </button>
              {openFAQ === i && (
                <div className="px-4 py-3 bg-gray-50 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-20 text-center">
          <div className="text-gray-700 text-base">
            Have questions? Chat with us on
            <div className="flex flex-col items-center gap-2 mt-2">
              <a
          href="https://wa.me/918625954301"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00CAFF] font-medium underline hover:text-[#4300FF] transition"
              >
          +91 8625954301
              </a>
              <a
          href="https://wa.me/917499189032"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00CAFF] font-medium underline hover:text-[#4300FF] transition"
              >
          +91 7499189032
              </a>
              <a
          href="https://wa.me/918767884789"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00CAFF] font-medium underline hover:text-[#4300FF] transition"
              >
          +91 8767884789
              </a>
              <a
          href="https://wa.me/918149847429"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00CAFF] font-medium underline hover:text-[#4300FF] transition"
              >
          +91 8149847429
              </a>
            </div>
            <div className="mt-2">
              or email us at{" "}
             📧 <a href="mailto:diplomatwodegree@gmail.com" className="underline hover:text-yellow-300">diplomatwodegree@gmail.com</a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
