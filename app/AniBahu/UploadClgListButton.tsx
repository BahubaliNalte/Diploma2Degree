"use client";

import { useRef, useState } from "react";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { storage } from "@/lib/firebase";

export default function UploadClgListButton({ requestId }: { requestId: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const storagePath = `clglist/${requestId}/${file.name}`;
      const fileRef = storageRef(storage, storagePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await update(dbRef(database, `requestclglist/${requestId}`), { adminClgListUrl: url });
    } catch (err: any) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInput}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInput.current?.click()}
        className="px-3 py-1 rounded bg-[#00CAFF] text-white hover:bg-[#4300FF] text-sm"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
