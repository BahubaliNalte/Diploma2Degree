'use client';

import { useState } from 'react';
import { auth, database, provider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push('/');
    } catch (err: any) {
      // Show user-friendly error messages
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again or use "Forgot password?" to reset.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please check your email or sign up.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later or reset your password.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await set(ref(database, 'Users/' + user.uid), {
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || '',
      });
      router.push('/');
    } catch (err: any) {
      setError('Google login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail) {
      setResetMsg("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Password reset email sent! Please check your inbox (and spam folder).");
    } catch (err: any) {
      setResetMsg("Failed to send reset email. Please check your email address.");
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
          <h2 className="text-3xl font-extrabold text-center text-[#4300FF] mb-6 tracking-tight drop-shadow">
            Login to Your Account
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="text-center mt-2 mb-4">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm font-medium"
              onClick={() => setResetMsg(resetMsg ? "" : "show")}
            >
              Forgot password?
            </button>
          </div>
          {resetMsg === "show" && (
            <form onSubmit={handleForgotPassword} className="mb-4 flex flex-col gap-2 items-center">
              <input
                type="email"
                placeholder="Enter your Gmail address"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#e0e7ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4300FF] text-base text-gray-900 bg-white"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">Send Reset Link</button>
            </form>
          )}
          {resetMsg && resetMsg !== "show" && (
            <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded mb-2 text-center">{resetMsg}</div>
          )}
          <div className="my-6 flex items-center justify-center">
            <div className="w-full border-t" />
            <span className="px-2 text-gray-500 text-sm">or</span>
            <div className="w-full border-t" />
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full bg-white border-2 border-[#e0e7ff] py-3 rounded-xl font-bold hover:shadow-md transition text-gray-700 flex items-center justify-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <img src="/Web Images/goolge-logo.png" alt="Google" className="w-5 h-5" />
            {loading ? 'Signing in with Google...' : 'Sign in with Google'}
          </button>
          <p className="mt-6 text-center text-base text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-[#4300FF] font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
