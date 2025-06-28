"use client";

import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function FeedbackImagesLanding() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manual fallback images
  const manualImages: string[] = [
    "/FeedBack Img/feedback-1.jpg",
    "/FeedBack Img/feedback-2.jpg",
    "/FeedBack Img/feedback-3.jpg",
    "/FeedBack Img/feedback-4.jpg",
    // Add more as needed
  ];

  useEffect(() => {
    const imgRef = ref(database, "feedbackImages");
    const unsubscribe = onValue(imgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((img: any) => img.imageUrl || "");
        setImages(arr.length > 0 ? arr : manualImages);
      } else {
        setImages(manualImages);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (images.length === 0) return <div className="text-gray-500">No feedback images yet.</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="relative">
        <div ref={containerRef} className="flex justify-center transition-all duration-500">
          <div className="bg-white rounded-xl shadow border flex items-center justify-center aspect-[4/5] overflow-hidden w-full">
            <img
              src={images[current]}
              alt={`User Feedback ${current + 1}`}
              className="object-contain w-full h-full p-2 bg-white"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          </div>
        </div>
        {/* Dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full border-2 border-[#4300FF] ${idx === current ? 'bg-[#4300FF]' : 'bg-white'}`}
                onClick={() => setCurrent(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
