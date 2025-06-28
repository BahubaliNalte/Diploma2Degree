"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, remove } from "firebase/database";

export type ClientReview = {
  id: string;
  name: string;
  review: string;
};

export default function ClientReviewAdmin() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reviewRef = ref(database, "clientReviews");
    const unsubscribe = onValue(reviewRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, r]: [string, any]) => ({
          id,
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) return;
    await push(ref(database, "clientReviews"), {
      name,
      review,
    });
    setName("");
    setReview("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this review?")) {
      await remove(ref(database, `clientReviews/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Client name"
          className="p-2 border border-gray-300 rounded w-full md:w-1/4"
        />
        <input
          type="text"
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Client review"
          className="p-2 border border-gray-300 rounded flex-1"
        />
        <button type="submit" className="px-4 py-2 rounded bg-[#4300FF] text-white font-semibold">Add</button>
      </form>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-bold mb-4 text-[#4300FF]">All Client Reviews</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <ul className="space-y-3">
            {reviews.map(r => (
              <li key={r.id} className="flex justify-between items-center border-b pb-2">
                <span><span className="font-semibold text-[#4300FF]">{r.name}:</span> {r.review}</span>
                <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
