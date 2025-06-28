"use client";

import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function ClientReviewsLanding() {
  const [reviews, setReviews] = useState<{ name: string; review: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive: 3 on desktop, 1 on mobile
  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 ? 3 : 1;
    }
    return 1;
  };
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const reviewRef = ref(database, "clientReviews");
    const unsubscribe = onValue(reviewRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((r: any) => ({
          name: r.name || "",
          review: r.review || "",
        }));
        setReviews(arr);
      } else {
        setReviews([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (reviews.length <= visibleCount) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews, visibleCount]);

  // Calculate visible reviews
  const getVisibleReviews = () => {
    if (reviews.length <= visibleCount) return reviews;
    let start = current;
    let end = start + visibleCount;
    if (end > reviews.length) {
      // Wrap around
      return [...reviews.slice(start), ...reviews.slice(0, end - reviews.length)];
    }
    return reviews.slice(start, end);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-[#e0f2ff] to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#4300FF] mb-8">What Our Clients Say</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <div className="relative">
            <div ref={containerRef} className="flex gap-6 justify-center transition-all duration-500">
              {getVisibleReviews().map((r, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 border-l-4 border-[#4300FF] text-left min-w-[260px] max-w-xs w-full">
                  <div className="text-lg text-gray-700 mb-2">"{r.review}"</div>
                  <div className="text-[#4300FF] font-semibold">- {r.name}</div>
                </div>
              ))}
            </div>
            {/* Dots */}
            {reviews.length > visibleCount && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: reviews.length }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full border-2 border-[#4300FF] ${idx === current ? 'bg-[#4300FF]' : 'bg-white'}`}
                    onClick={() => setCurrent(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
