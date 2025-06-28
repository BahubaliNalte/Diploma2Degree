"use client";

import { useEffect, useState, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export type Banner = {
  imageUrl: string;
  text: string;
};

export default function PremiumBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manual fallback banners
  const manualBanners: Banner[] = [
    {
      imageUrl: "/Banner/Banner1.png",
      text: "Get expert guidance for your engineering journey!",
    },
    {
      imageUrl: "/Banner/Banner6.jpeg",
      text: "Unlock premium features and college lists!",
    },
    {
      imageUrl: "/Banner/Banner3.png",
      text: "Book your slot for 1:1 mentorship now!",
    },
     {
      imageUrl: "/Banner/b1.jpg",
      text: "Get expert guidance for your engineering journey!",
    },
    {
      imageUrl: "/Banner/b2.jpg",
      text: "Unlock premium features and college lists!",
    },
    {
      imageUrl: "/Banner/Banner4.jpg",
      text: "Book your slot for 1:1 mentorship now!",
    },
    // Add more banners as needed
  ];

  useEffect(() => {
    const bannerRef = ref(database, "banners");
    const unsubscribe = onValue(bannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((b: any) => ({
          imageUrl: b.imageUrl || "",
          text: b.text || "",
        }));
        setBanners(arr.length > 0 ? arr : manualBanners);
      } else {
        setBanners(manualBanners);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (banners.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners, currentBanner]);

  if (banners.length === 0 || !banners[currentBanner]?.imageUrl) return null;

  const goToBanner = (idx: number) => {
    setCurrentBanner(idx);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto h-48 sm:h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden mb-10 shadow-md group bg-gray-200 px-2">
      {/* Banner Image with fade transition */}
      <img
        src={banners[currentBanner].imageUrl}
        alt={`Banner ${currentBanner + 1}`}
        className="w-full h-full object-contain object-center transition-opacity duration-700 ease-in-out opacity-100 select-none"
        draggable={false}
        style={{ background: '#e5e7eb' }}
      />
      {/* Overlay (optional for text) */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-4 text-center pointer-events-none">
        <h2 className="text-xl md:text-3xl font-semibold text-white drop-shadow-lg">
          {/* If you ever add text again: {banners[currentBanner].text} */}
        </h2>
      </div>
      {/* Left Arrow */}
      <button
        aria-label="Previous banner"
        onClick={prevBanner}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        tabIndex={0}
        style={{ transition: 'opacity 0.3s' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
      {/* Right Arrow */}
      <button
        aria-label="Next banner"
        onClick={nextBanner}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        tabIndex={0}
        style={{ transition: 'opacity 0.3s' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to banner ${idx + 1}`}
            onClick={() => goToBanner(idx)}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${currentBanner === idx ? 'bg-white' : 'bg-white/40'}`}
            style={{ outline: 'none' }}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}
