"use client";

import { useEffect, useRef, useState } from "react";
import { database, storage } from "@/lib/firebase";
import { ref as dbRef, onValue, push, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export type FeedbackImage = {
  id: string;
  imageUrl: string;
};

export default function FeedbackImageAdmin() {
  const [images, setImages] = useState<FeedbackImage[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const imgRef = dbRef(database, "feedbackImages");
    const unsubscribe = onValue(imgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, b]: [string, any]) => ({
          id,
          imageUrl: b.imageUrl || "",
        }));
        setImages(arr);
      } else {
        setImages([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setSuccess("");
    try {
      const storagePath = `feedbackImages/${Date.now()}_${image.name}`;
      const imgRef = storageRef(storage, storagePath);
      await uploadBytes(imgRef, image);
      const url = await getDownloadURL(imgRef);
      await push(dbRef(database, "feedbackImages"), {
        imageUrl: url,
      });
      setSuccess("Image is added");
    } catch (err) {
      setSuccess("Failed to add image. Try again.");
    }
    setImage(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this feedback image?")) {
      await remove(dbRef(database, `feedbackImages/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6 items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="p-2 border border-gray-300 rounded w-full md:w-1/4"
        />
        <button type="submit" className="px-4 py-2 rounded bg-[#4300FF] text-white font-semibold">Add</button>
      </form>
      {success && <div className={`mb-4 text-sm font-semibold ${success.includes('added') ? 'text-green-600' : 'text-red-600'}`}>{success}</div>}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-bold mb-4 text-[#4300FF]">All Feedback Images</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : images.length === 0 ? (
          <div className="text-gray-500">No feedback images yet.</div>
        ) : (
          <ul className="space-y-3">
            {images.map(img => (
              <li key={img.id} className="flex justify-between items-center border-b pb-2 gap-4">
                <div className="flex items-center gap-3">
                  {img.imageUrl ? (
                    <img src={img.imageUrl} alt="Feedback" className="w-20 h-12 object-cover rounded" />
                  ) : null}
                </div>
                <button onClick={() => handleDelete(img.id)} className="text-red-500 hover:underline text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
