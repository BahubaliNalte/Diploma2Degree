// lib/firebaseAdmin.ts

import admin from "firebase-admin";

import serviceAccountJson from "../serviceAccountKey.json";
import type { ServiceAccount } from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJson as ServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // Set this in .env.local
  });
}

export default admin;
