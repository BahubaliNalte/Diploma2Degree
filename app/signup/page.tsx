'use client';

import { useState } from 'react';
import { auth, database } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get, ref as dbRef } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Validate phone
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }
    // Validate email (must be gmail.com)
    if (!/^([a-zA-Z0-9_.+-])+@gmail\.com$/.test(form.email)) {
      setError("Please enter a valid Gmail address ending with @gmail.com.");
      setLoading(false);
      return;
    }
    // Validate password
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("Password must be at least 8 characters, include a number and an uppercase letter.");
      setLoading(false);
      return;
    }
    // Check for duplicate email
    try {
      const db = database;
      const usersRef = dbRef(db, 'Users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const emailExists = Object.values(users).some((u: any) => u.email === form.email);
        if (emailExists) {
          setError("This email is already registered. Please use another email or login.");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // ignore DB error, fallback to Firebase Auth error
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: form.name });

      await set(ref(database, 'Users/' + user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      router.push('/');
    } catch (err: any) {
      // Show user-friendly password error
      if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use another email or login.');
      } else {
        setError('Signup failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Stylish Home button at the top */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #0070f3 60%, #00c6ff 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,112,243,0.08)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            <FaHome size={18} /> Home
          </span>
        </Link>
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f0f4ff] px-2 py-8">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-[#e0e7ff]">
          <h2 className="text-3xl font-extrabold text-center text-[#4300FF] mb-6 tracking-tight drop-shadow">Create Account</h2>
          <form onSubmit={handleSignup} className="space-y-5">
            {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold">{error}</div>}
            <input
              type="text"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#e0e7ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-lg text-gray-900 bg-white"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#e0e7ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-lg text-gray-900 bg-white"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#e0e7ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-lg text-gray-900 bg-white"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#e0e7ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-lg text-gray-900 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4300FF] to-[#00CAFF] text-white py-3 rounded-xl font-bold text-lg shadow-md hover:from-[#4300FF] hover:to-[#00CAFF] transition"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-base text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4300FF] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
